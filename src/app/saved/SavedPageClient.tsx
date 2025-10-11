"use client";

import { useState, useCallback } from "react";
import PromoCardEnhanced from "@/components/PromoCardEnhanced";
import { Heart, SlidersHorizontal, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Loading from "@/components/ui/Loading";
import { createClient } from "@/lib/supabase/client";
import { usePromotionList } from "@/hooks/usePromotionList";
import { Promotion } from "@/types/promotion";
import { toast } from "sonner";
import FilterBottomSheet from "@/components/layout/FilterBottomSheet";

interface SavedPromotionItem {
  promo_id: string;
  promo: {
    id: string;
    title: string;
    raw_title: string;
    deal_type: string;
    normal_price: number;
    sale_price: number;
    start_date: string;
    end_date: string;
    image_url: string;
    barcode: string | null;
    source_url: string;
    description: string | null;
    category: string | null;
    brand: {
      name: string;
    } | null;
  } | null;
}

interface SavedPageClientProps {
  initialPromos: Promotion[];
  totalCount: number;
  userEmail: string;
}

export default function SavedPageClient({
  initialPromos,
  totalCount,
  userEmail,
}: SavedPageClientProps) {
  const ITEMS_PER_PAGE = 10;

  // 필터 상태
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDeal, setSelectedDeal] = useState("ALL");
  const [selectedSort] = useState("saved");

  // 일괄 삭제 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPromoIds, setSelectedPromoIds] = useState<Set<string>>(
    new Set()
  );

  // 통합 훅 사용
  const {
    promos,
    loadingMore,
    hasMore,
    loadMoreRef,
    savedPromoIds,
    handleSaveToggle: hookHandleSaveToggle,
  } = usePromotionList({
    initialData: initialPromos,
    fetchData: async (page) => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user?.email) {
        return { data: [], hasMore: false };
      }

      const { data, error } = await supabase
        .from("saved_promotions")
        .select(
          `
          promo_id,
          promo:promo_id (
            id,
            title,
            raw_title,
            deal_type,
            normal_price,
            sale_price,
            start_date,
            end_date,
            image_url,
            barcode,
            source_url,
            description,
            category,
            brand:brand_id (
              name
            )
          )
        `
        )
        .eq("user_email", userData.user.email)
        .order("created_at", { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      const newPromos = ((data as unknown as SavedPromotionItem[])
        ?.map((item) => {
          if (!item.promo) return null;
          const promo = item.promo;
          return {
            id: promo.id,
            brand_name: promo.brand?.name || "",
            title: promo.title,
            deal_type: promo.deal_type,
            start_date: promo.start_date,
            end_date: promo.end_date,
            sale_price: promo.sale_price,
            normal_price: promo.normal_price,
            image_url: promo.image_url,
            barcode: promo.barcode || undefined,
            source_url: promo.source_url,
            raw_title: promo.raw_title,
            category: promo.category || undefined,
          } as Promotion;
        })
        .filter((item): item is Promotion => item !== null) ||
        []) as Promotion[];

      return {
        data: newPromos,
        hasMore: newPromos.length === ITEMS_PER_PAGE,
      };
    },
  });

  // 저장 해제 시 목록에서 제거하는 래퍼
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const handleSaveToggle = useCallback(
    async (promoId: string) => {
      const result = await hookHandleSaveToggle(promoId);

      // 토스트 알림
      if (result.success) {
        if (result.saved) {
          toast.success("프로모션을 저장했습니다");
        } else {
          toast.success("저장을 해제했습니다");
          // 저장 해제 시 removedIds에 추가
          setRemovedIds((prev) => new Set(prev).add(promoId));
        }
      } else {
        toast.error("처리 중 오류가 발생했습니다");
      }

      return result;
    },
    [hookHandleSaveToggle]
  );

  // 만료 여부 확인
  const isExpiredPromo = useCallback((endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return end < today;
  }, []);

  // 필터 적용 핸들러
  const handleFilterApply = useCallback(
    (filters: {
      brand: string;
      category: string;
      deal: string;
      sort: string;
    }) => {
      setSelectedBrand(filters.brand);
      setSelectedCategory(filters.category);
      setSelectedDeal(filters.deal);
    },
    []
  );

  // 저장된 프로모션만 필터링 + 제거된 항목 제외 + 필터 적용
  const displayedPromos = promos.filter((promo) => {
    if (!savedPromoIds.has(promo.id) || removedIds.has(promo.id)) return false;

    // 브랜드 필터
    if (selectedBrand !== "ALL" && promo.brand_name !== selectedBrand)
      return false;

    // 카테고리 필터
    if (selectedCategory !== "ALL" && promo.category !== selectedCategory)
      return false;

    // 행사 유형 필터
    if (selectedDeal !== "ALL" && promo.deal_type !== selectedDeal)
      return false;

    return true;
  });

  // 활성 필터 개수
  const activeFilterCount = [
    selectedBrand !== "ALL",
    selectedCategory !== "ALL",
    selectedDeal !== "ALL",
  ].filter(Boolean).length;

  // 일괄 삭제 핸들러
  const handleBulkDelete = useCallback(async () => {
    if (selectedPromoIds.size === 0) return;

    try {
      for (const promoId of selectedPromoIds) {
        await hookHandleSaveToggle(promoId);
      }
      toast.success(`${selectedPromoIds.size}개의 프로모션을 삭제했습니다`);
      setSelectedPromoIds(new Set());
      setIsEditMode(false);
    } catch (error) {
      toast.error("삭제 중 오류가 발생했습니다");
    }
  }, [selectedPromoIds, hookHandleSaveToggle]);

  // 체크박스 토글
  const handleCheckboxToggle = useCallback((promoId: string) => {
    setSelectedPromoIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(promoId)) {
        newSet.delete(promoId);
      } else {
        newSet.add(promoId);
      }
      return newSet;
    });
  }, []);

  // 전체 선택/해제
  const handleSelectAll = useCallback(() => {
    if (selectedPromoIds.size === displayedPromos.length) {
      setSelectedPromoIds(new Set());
    } else {
      setSelectedPromoIds(new Set(displayedPromos.map((p) => p.id)));
    }
  }, [selectedPromoIds.size, displayedPromos]);

  return (
    <>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              {!isEditMode ? (
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-gray-900 truncate">
                    <Heart className="inline-block w-5 h-5 mr-1 text-red-500 fill-red-500" />
                    저장한 프로모션
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {totalCount > 0
                      ? `${totalCount}개의 프로모션을 저장했어요`
                      : "나중에 보고 싶은 프로모션을 저장하세요"}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900">편집</h1>
                  {selectedPromoIds.size > 0 && (
                    <span className="text-sm text-gray-600">
                      ({selectedPromoIds.size}개 선택)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 우측 버튼들 */}
            <div className="flex items-center gap-2">
              {!isEditMode ? (
                <>
                  {/* 필터 버튼 */}
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                  {/* 편집 버튼 */}
                  {displayedPromos.length > 0 && (
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      편집
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* 전체 선택 버튼 */}
                  <button
                    onClick={handleSelectAll}
                    className="px-2 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {selectedPromoIds.size === displayedPromos.length ? "해제" : "전체"}
                  </button>
                  {/* 삭제 버튼 */}
                  {selectedPromoIds.size > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-2 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
                    >
                      삭제
                    </button>
                  )}
                  {/* 취소 버튼 */}
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setSelectedPromoIds(new Set());
                    }}
                    className="px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
                  >
                    취소
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="px-3 pb-16 pt-3">
        {displayedPromos.length > 0 ? (
          <>
            <div className="space-y-3">
              {displayedPromos.map((promo) => (
                <div key={promo.id} className="relative">
                  {isEditMode && (
                    <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={selectedPromoIds.has(promo.id)}
                        onChange={() => handleCheckboxToggle(promo.id)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  )}
                  <PromoCardEnhanced
                    promotion={promo}
                    isSaved={savedPromoIds.has(promo.id)}
                    isExpired={isExpiredPromo(promo.end_date)}
                    onSaveToggle={isEditMode ? undefined : handleSaveToggle}
                  />
                </div>
              ))}
            </div>

            {/* 무한스크롤 트리거 */}
            <div ref={loadMoreRef} className="py-4">
              {loadingMore && <Loading />}
              {!hasMore && displayedPromos.length > 0 && (
                <p className="text-center text-gray-500 text-sm">
                  모든 저장한 프로모션을 불러왔습니다
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-1">저장한 프로모션이 없습니다</p>
            <p className="text-gray-400 text-sm">
              홈에서 관심있는 프로모션을 저장해보세요
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              프로모션 보러가기
            </Link>
          </div>
        )}

        {/* 필터 바텀시트 */}
        <FilterBottomSheet
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          selectedBrand={selectedBrand}
          selectedCategory={selectedCategory}
          selectedDeal={selectedDeal}
          selectedSort={selectedSort}
          onApply={handleFilterApply}
        />
      </main>
    </>
  );
}

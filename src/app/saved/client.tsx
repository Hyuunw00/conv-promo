"use client";

import { useState, useCallback } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";
import Loading from "@/components/Loading";
import { usePromotions } from "@/hooks/use-promotions";
import { Promotion } from "@/types/promotion";
import { toast } from "sonner";
import FilterBottomSheet from "@/components/filter-botton-sheet";
import { fetchSavedPromotions } from "@/lib/api/saved.api";
import SavedHeader from "@/components/saved/saved-header";
import PromoCard from "@/components/promo-card";

interface SavedPageClientProps {
  initialData: Promotion[];
  totalCount: number;
  userEmail: string;
}

export default function SavedPageClient({
  initialData,
  totalCount,
  userEmail,
}: SavedPageClientProps) {
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
  } = usePromotions({
    initialData,
    fetchData: async (page: number) => {
      return await fetchSavedPromotions(userEmail, page);
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
    // saved 페이지의 promos는 이미 모두 저장된 것들
    if (removedIds.has(promo.id)) return false;

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

  // 예상 구매/절약 금액 계산
  const calculatePrices = useCallback(() => {
    let totalPurchase = 0; // 예상 구매 금액
    let totalSavings = 0; // 예상 절약 금액

    displayedPromos.forEach((promo) => {
      const salePrice = promo.sale_price || 0;
      const normalPrice = promo.normal_price || salePrice;

      if (promo.deal_type === "ONE_PLUS_ONE") {
        // 1+1: 1개 사면 1개 공짜
        totalPurchase += salePrice * 1; // 1개 지불
        totalSavings += salePrice * 1; // 1개 공짜
      } else if (promo.deal_type === "TWO_PLUS_ONE") {
        // 2+1: 2개 사야 1개 공짜
        totalPurchase += salePrice * 2; // 2개 지불
        totalSavings += salePrice * 1; // 1개 공짜
      } else {
        // 할인: 정가 - 할인가
        totalPurchase += salePrice;
        totalSavings += normalPrice - salePrice;
      }
    });

    return { totalPurchase, totalSavings };
  }, [displayedPromos]);

  const { totalPurchase, totalSavings } = calculatePrices();

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
      <SavedHeader
        isEditMode={isEditMode}
        totalCount={totalCount}
        selectedPromoIds={selectedPromoIds}
        setSelectedPromoIds={setSelectedPromoIds}
        setIsFilterOpen={setIsFilterOpen}
        setIsEditMode={setIsEditMode}
        handleSelectAll={handleSelectAll}
        handleBulkDelete={handleBulkDelete}
        activeFilterCount={activeFilterCount}
        displayedPromos={displayedPromos}
      />

      <main className="px-3 pb-16 pt-3">
        {displayedPromos.length > 0 ? (
          <>
            {/* 가격 정보 카드 */}
            {!isEditMode && (
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    💰 예상 금액
                  </h3>
                  <span className="text-xs text-gray-500">
                    {displayedPromos.length}개 상품
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      예상 구매 금액
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      {totalPurchase.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                    <span className="text-sm text-blue-700 font-medium">
                      예상 절약 금액
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {totalSavings.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {displayedPromos.map((promo, index) => (
                <div
                  key={promo.id}
                  className={`relative ${
                    isEditMode && selectedPromoIds.has(promo.id)
                      ? "ring-2 ring-blue-500 rounded-xl"
                      : ""
                  }`}
                  onClick={
                    isEditMode
                      ? () => handleCheckboxToggle(promo.id)
                      : undefined
                  }
                >
                  {isEditMode && (
                    <div className="absolute top-3 left-3 z-10 pointer-events-none">
                      <div
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          selectedPromoIds.has(promo.id)
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {selectedPromoIds.has(promo.id) && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
                  <PromoCard
                    promotion={promo}
                    isSaved={savedPromoIds.has(promo.id)}
                    isExpired={isExpiredPromo(promo.end_date)}
                    onSaveToggle={isEditMode ? undefined : handleSaveToggle}
                    priority={index === 0}
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

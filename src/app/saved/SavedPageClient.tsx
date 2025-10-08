"use client";

import { useState, useCallback } from "react";
import PromoCardEnhanced from "@/components/PromoCardEnhanced";
import { Heart } from "lucide-react";
import Link from "next/link";
import Loading from "@/components/ui/Loading";
import { createClient } from "@/lib/supabase/client";
import { usePromotionList } from "@/hooks/usePromotionList";

interface SavedPageClientProps {
  initialPromos: any[];
  totalCount: number;
  userEmail: string;
}

export default function SavedPageClient({
  initialPromos,
  totalCount,
  userEmail,
}: SavedPageClientProps) {
  const ITEMS_PER_PAGE = 10;

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

      const newPromos =
        data
          ?.map((item: any) => {
            if (!item.promo) return null;
            return {
              ...item.promo,
              brand_name: item.promo.brand?.name,
            };
          })
          .filter(Boolean) || [];

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

      // 저장 해제 시 removedIds에 추가
      if (result.success && !result.saved) {
        setRemovedIds((prev) => new Set(prev).add(promoId));
      }

      return result;
    },
    [hookHandleSaveToggle]
  );

  // 저장된 프로모션만 필터링 + 제거된 항목 제외
  const displayedPromos = promos.filter(
    (promo) => savedPromoIds.has(promo.id) && !removedIds.has(promo.id)
  );

  return (
    <main className="px-3 pb-16 pt-3">
      {displayedPromos.length > 0 ? (
        <>
          <div className="space-y-3">
            {displayedPromos.map((promo) => (
              <PromoCardEnhanced
                key={promo.id}
                promotion={promo}
                isSaved={savedPromoIds.has(promo.id)}
                onSaveToggle={handleSaveToggle}
              />
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
    </main>
  );
}

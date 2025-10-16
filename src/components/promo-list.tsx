"use client";

import { usePromotions } from "@/hooks/use-promotions";
import PromoCard from "@/components/promo-card";
import Loading from "@/components/Loading";
import { Promotion } from "@/types/promotion";
import { toast } from "sonner";

interface PromotionListProps {
  initialData: Promotion[];
  filters: {
    brandName: string;
    dealType: string;
    category: string;
    startDate: string;
    endDate: string;
    orderBy?: string;
  };
}

export default function PromotionList({
  initialData,
  filters,
}: PromotionListProps) {
  const fetchData = async (page: number) => {
    const params = new URLSearchParams();
    if (filters.brandName) params.append("brandName", filters.brandName);
    if (filters.dealType) params.append("dealType", filters.dealType);
    if (filters.category) params.append("category", filters.category);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.orderBy) params.append("orderBy", filters.orderBy);
    params.append("offset", String(page * 20));

    const response = await fetch(`/api/promotions?${params}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch promotions");
    }

    return {
      data: result.data || [],
      hasMore: result.hasMore || false,
    };
  };

  // usePromotions 훅 사용
  const {
    promos,
    loading,
    loadingMore,
    hasMore,
    savedPromoIds,
    handleSaveToggle: onSaveToggle,
    loadMoreRef,
  } = usePromotions({
    initialData,
    fetchData,
  });

  const handleSaveToggle = async (promoId: string) => {
    const result = await onSaveToggle(promoId);
    if (result.success) {
      if (result.saved) {
        toast.success("프로모션을 저장했습니다");
      } else {
        toast.success("저장을 해제했습니다");
      }
    } else {
      toast.error("처리 중 오류가 발생했습니다");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!loading && promos.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <p className="text-gray-500">선택한 조건의 행사가 없습니다</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {promos.map((promo, index) => (
          <PromoCard
            key={promo.id}
            promotion={promo}
            isSaved={savedPromoIds.has(promo.id)}
            onSaveToggle={handleSaveToggle}
            priority={index === 0}
          />
        ))}
      </div>

      {/* 무한스크롤 트리거 */}
      <div ref={loadMoreRef} className="py-4">
        {loadingMore && <Loading />}
        {!hasMore && promos.length > 0 && (
          <p className="text-center text-gray-500 text-sm">
            모든 프로모션을 불러왔습니다
          </p>
        )}
      </div>
    </>
  );
}

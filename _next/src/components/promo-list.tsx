"use client";

import { usePromotions } from "@/hooks/use-promotions";
import PromoCard from "@/components/promo-card";
import Loading from "@/components/loading";
import { Promotion } from "@/types/promotion";
import { toast } from "sonner";
import { fetchPromotions } from "@/lib/promotions";
import { useEffect } from "react";

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
    const result = await fetchPromotions({
      brandName: filters.brandName || undefined,
      dealType: filters.dealType || undefined,
      category: filters.category || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      orderBy: filters.orderBy as
        | "start_date"
        | "end_date"
        | "created_at"
        | "saved_count"
        | undefined,
      offset: page * 20,
      limit: 20,
    });

    if (result.error) {
      throw new Error(result.error);
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
    resetData,
  } = usePromotions({
    initialData,
    fetchData,
  });

  // 필터 변경 시 데이터 리셋 및 리페치
  useEffect(() => {
    const refetchData = async () => {
      const result = await fetchPromotions({
        brandName: filters.brandName || undefined,
        dealType: filters.dealType || undefined,
        category: filters.category || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        orderBy: filters.orderBy as
          | "start_date"
          | "end_date"
          | "created_at"
          | "saved_count"
          | undefined,
        offset: 0,
        limit: 20,
      });

      if (!result.error && result.data) {
        resetData(result.data);
      }
    };

    refetchData();
  }, [
    filters.brandName,
    filters.category,
    filters.dealType,
    filters.startDate,
    filters.endDate,
    filters.orderBy,
    resetData,
  ]);

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

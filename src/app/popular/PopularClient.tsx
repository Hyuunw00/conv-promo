"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PromoCardEnhanced from "@/components/PromoCardEnhanced";
import { Promotion } from "@/types/promotion";
import Loading from "@/components/ui/Loading";
import { usePromotionList } from "@/hooks/usePromotionList";

interface PopularClientProps {
  initialFilter: string;
  initialPromos: Promotion[];
  daysAgo: number;
}

export default function PopularClient({
  initialFilter,
  initialPromos,
  daysAgo: initialDaysAgo,
}: PopularClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const timeFilter = (searchParams.get("filter") || initialFilter) as
    | "today"
    | "week"
    | "month";

  const [currentDaysAgo, setCurrentDaysAgo] = useState(initialDaysAgo);

  // 통합 훅 사용
  const {
    promos,
    loadingMore,
    loadMoreRef,
    savedPromoIds,
    handleSaveToggle,
    resetData,
  } = usePromotionList({
    initialData: initialPromos,
    fetchData: async (page) => {
      const response = await fetch(
        `/api/promotions/popular?limit=10&offset=${page * 10}&daysAgo=${currentDaysAgo}`
      );
      const result = await response.json();

      return {
        data: result.data || [],
        hasMore: result.data?.length === 10 && (page + 1) * 10 < 30,
      };
    },
  });

  // 30위까지만 표시
  const displayedPromos = promos.slice(0, 30);

  const handleFilterChange = (filterId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", filterId);
    router.push(`/popular?${params.toString()}`, { scroll: false });
  };

  // 필터 변경시 daysAgo 업데이트
  useEffect(() => {
    let newDaysAgo = 0;
    switch (timeFilter) {
      case "week":
        newDaysAgo = 7;
        break;
      case "month":
        newDaysAgo = 30;
        break;
      default:
        newDaysAgo = 0;
    }
    setCurrentDaysAgo(newDaysAgo);
    resetData(initialPromos);
  }, [timeFilter, initialPromos, resetData]);

  return (
    <>
      {/* 필터 버튼 */}
      <div className="px-4 py-4 bg-gradient-to-b from-white to-gray-50">
        <div className="flex gap-3 justify-center">
          {[
            { id: "today", label: "오늘" },
            { id: "week", label: "이번주" },
            { id: "month", label: "이번달" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                timeFilter === filter.id
                  ? "bg-orange-500 text-white shadow-orange-200"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* 프로모션 리스트 */}
      <main className="px-3 pb-16 pt-3">
        {displayedPromos.length === 0 ? (
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
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <p className="text-gray-500">아직 인기 프로모션이 없습니다</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayedPromos.map((promo, index) => (
                <div key={promo.id} className="relative">
                  {/* 순위 뱃지 - 모든 순위 표시 */}
                  <div className="absolute -top-2 -left-2 z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                        index === 0
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-yellow-200"
                          : index === 1
                          ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-gray-200"
                          : index === 2
                          ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-orange-200"
                          : "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>
                  <PromoCardEnhanced
                    promotion={promo}
                    isSaved={savedPromoIds.has(promo.id)}
                    onSaveToggle={handleSaveToggle}
                  />
                </div>
              ))}
            </div>

            {/* 무한스크롤 트리거 */}
            {displayedPromos.length < 30 && (
              <div ref={loadMoreRef} className="py-4">
                {loadingMore && <Loading />}
              </div>
            )}

            {/* 30위 도달 메시지 */}
            {displayedPromos.length >= 30 && (
              <div className="py-8 text-center">
                <p className="text-gray-500 text-sm">
                  🏆 TOP 30 프로모션을 모두 확인했습니다
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

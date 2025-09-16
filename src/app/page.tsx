"use client";

import { useState, useEffect, useRef } from "react";
import { useInfinitePromotions } from "@/hooks/useInfinitePromotions";
import Header from "@/components/layout/Header";
import PromoCard from "@/components/PromoCard";
import Loading from "@/components/ui/Loading";

export default function Home() {
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedDeal, setSelectedDeal] = useState<string>("ALL");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 날짜 필터 상태 (오늘부터 14일)
  const today = new Date();
  const defaultEndDate = new Date(today);
  defaultEndDate.setDate(today.getDate() + 14);

  const [selectedDateRange, setSelectedDateRange] = useState({
    start: today.toISOString().split("T")[0],
    end: defaultEndDate.toISOString().split("T")[0],
  });

  // 무한스크롤 훅 사용
  const { promos, loading, loadingMore, hasMore, fetchMore } =
    useInfinitePromotions({
      brandName: selectedBrand,
      dealType: selectedDeal,
      startDate: selectedDateRange.start,
      endDate: selectedDateRange.end,
    });

  // Intersection Observer 설정
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loadingMore, fetchMore]);

  return (
    <>
      <Header
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
        selectedDeal={selectedDeal}
        onDealChange={setSelectedDeal}
        onDateRangeChange={(start, end) => setSelectedDateRange({ start, end })}
      />

      {/* 메인 콘텐츠 */}
      <main className="px-3 pb-16">
        {loading ? (
          <Loading />
        ) : !loading && promos.length === 0 ? (
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
        ) : (
          <>
            <div className="space-y-3">
              {promos.map((promo) => (
                <PromoCard key={promo.id} promotion={promo} />
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
        )}
      </main>
    </>
  );
}

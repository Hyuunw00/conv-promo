"use client";

import { useState, useEffect } from "react";
import { PromotionService } from "@/services/promotion/promotion.service";
import { Promotion } from "@/types/promotion";
import PromoCard from "@/components/PromoCard";
import Loading from "@/components/ui/Loading";

export default function PopularPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month">(
    "today"
  );

  useEffect(() => {
    const fetchPopularPromos = async () => {
      setLoading(true);

      // 기간별 일수 설정
      let daysAgo = 0;
      switch (timeFilter) {
        case "week":
          daysAgo = 7;
          break;
        case "month":
          daysAgo = 30;
          break;
        default:
          daysAgo = 0; // 오늘
      }

      const { data } = await PromotionService.fetchPopularPromotions(
        30,
        daysAgo
      );

      setPromos(data || []);
      setLoading(false);
    };

    fetchPopularPromos();
  }, [timeFilter]);

  return (
    <>
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">🔥 인기 프로모션</h1>
          <p className="text-xs text-gray-500 mt-0.5">지금 가장 핫한 행사들</p>
        </div>

        {/* 기간 필터 */}
        <div className="px-4 pb-3">
          <div className="flex gap-2">
            {[
              { id: "today", label: "오늘" },
              { id: "week", label: "이번주" },
              { id: "month", label: "이번달" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id as typeof timeFilter)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  timeFilter === filter.id
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 콘텐츠 */}
      <main className="px-3 pb-16 pt-3">
        {loading ? (
          <Loading />
        ) : promos.length === 0 ? (
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
          <div className="space-y-3">
            {promos.map((promo, index) => (
              <div key={promo.id} className="relative">
                {/* 순위 뱃지 */}
                {index < 3 && (
                  <div className="absolute -top-2 -left-2 z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                          : index === 1
                          ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white"
                          : "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>
                )}
                <PromoCard promotion={promo} />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

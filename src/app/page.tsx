"use client";

import { useMemo, useState } from "react";
import { usePromotions } from "@/hooks/usePromotions";
import Header from "@/components/layout/Header";
import PromoCard from "@/components/PromoCard";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { BrandType } from "@/types/brand";
import { DealType } from "@/types/deal";
import Loading from "@/components/ui/Loading";

export default function Home() {
  const [selectedBrand, setSelectedBrand] = useState<BrandType>("all");
  const [selectedDeal, setSelectedDeal] = useState<DealType>("all");

  // 날짜 필터 상태 (오늘부터 14일)
  const today = new Date();
  const defaultEndDate = new Date(today);
  defaultEndDate.setDate(today.getDate() + 14);

  const [dateRange, setDateRange] = useState({
    start: today.toISOString().split("T")[0],
    end: defaultEndDate.toISOString().split("T")[0],
  });

  const { promos, loading, error } = usePromotions();

  // console.log("promos", promos);

  //  실제로 보여줄 프로모션 필터링 (날짜 필터 추가)
  const filteredPromos = useMemo(
    () =>
      promos.filter((promo) => {
        // 브랜드 필터
        if (selectedBrand !== "all" && promo.brand_name !== selectedBrand)
          return false;

        // 행사 유형 필터
        if (selectedDeal !== "all" && promo.deal_type !== selectedDeal)
          return false;

        // 날짜 필터 - 프로모션 기간과 선택 기간이 겹치는지 확인
        const promoStart = new Date(promo.start_date);
        const promoEnd = new Date(promo.end_date);
        const filterStart = new Date(dateRange.start);
        const filterEnd = new Date(dateRange.end);

        // 기간이 겹치는 조건: 프로모션 종료일 >= 필터 시작일 AND 프로모션 시작일 <= 필터 종료일
        if (promoEnd < filterStart || promoStart > filterEnd) {
          return false;
        }

        return true;
      }),
    [promos, selectedBrand, selectedDeal, dateRange]
  );

  const uniqueBrands = Array.from(
    new Set(promos.map((promo) => promo.brand_name))
  );

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
      <Header
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
        brands={uniqueBrands as BrandType[]}
        selectedDeal={selectedDeal}
        onDealChange={setSelectedDeal}
        onDateRangeChange={(start, end) => setDateRange({ start, end })}
      />

      {/* 메인 콘텐츠 */}
      <main className="px-3 pb-16">
        {loading ? (
          <Loading />
        ) : (
          <div className="space-y-3">
            {filteredPromos.map((promo) => (
              <PromoCard key={promo.id} promotion={promo} />
            ))}
          </div>
        )}

        {filteredPromos.length === 0 && !loading && (
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
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { usePromotions } from "@/hooks/usePromotions";
import Header from "@/components/layout/Header";
import DealTypeFilter from "@/components/layout/DealTypeFilter";
import PromoCard from "@/components/PromoCard";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { BrandType } from "@/types/brand";
import { DealType } from "@/types/deal";

export default function Home() {
  const [selectedBrand, setSelectedBrand] = useState<BrandType>("all");
  const [selectedDeal, setSelectedDeal] = useState<DealType>("all");

  const { promos, loading, error } = usePromotions();

  // console.log("promos", promos);

  //  실제로 보여줄 프로모션 필터링
  const filteredPromos = useMemo(
    () =>
      promos.filter((promo) => {
        if (selectedBrand !== "all" && promo.brand_name !== selectedBrand)
          return false;
        if (selectedDeal !== "all" && promo.deal_type !== selectedDeal)
          return false;
        return true;
      }),
    [promos, selectedBrand, selectedDeal]
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
      />

      <DealTypeFilter
        selectedDeal={selectedDeal}
        onDealChange={setSelectedDeal}
      />

      {/* 메인 콘텐츠 */}
      <main className="px-3 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          </div>
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

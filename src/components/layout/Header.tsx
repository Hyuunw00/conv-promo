"use client";

import { BrandType } from "@/types/brand";
import { DealType } from "@/types/deal";
import DateRangeFilter from "./DateRangeFilter";
import DealTypeFilter from "./DealTypeFilter";

interface HeaderProps {
  selectedBrand: string;
  onBrandChange: (brand: BrandType) => void;
  brands: BrandType[];
  selectedDeal: DealType;
  onDealChange: (deal: DealType) => void;
  onDateRangeChange: (start: string, end: string) => void;
}

export default function Header({
  selectedBrand,
  onBrandChange,
  brands,
  selectedDeal,
  onDealChange,
  onDateRangeChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">편털</span>
            </div>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 브랜드 필터 탭 */}
      <div className="px-3 pb-2">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => onBrandChange("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedBrand === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            전체
          </button>
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => onBrandChange(brand)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedBrand === brand
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* 날짜 필터 */}
      <DateRangeFilter onDateRangeChange={onDateRangeChange} />

      {/* 행사 유형 필터 */}
      <DealTypeFilter selectedDeal={selectedDeal} onDealChange={onDealChange} />
    </header>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DateRangeFilter from "./DateRangeFilter";
import FilterBottomSheet from "./FilterBottomSheet";
import { SlidersHorizontal } from "lucide-react";

interface HeaderProps {
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  selectedDeal: string;
  onDealChange: (deal: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onDateRangeChange: (start: string, end: string) => void;
  initialStartDate: string;
  initialEndDate: string;
  onFiltersChange?: (brand: string, category: string, deal: string) => void;
}

export default function Header({
  selectedBrand,
  onBrandChange,
  selectedDeal,
  onDealChange,
  selectedCategory,
  onCategoryChange,
  onDateRangeChange,
  initialStartDate,
  initialEndDate,
  onFiltersChange,
}: HeaderProps) {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleFilterApply = (filters: {
    brand: string;
    category: string;
    deal: string;
  }) => {
    // 한 번에 모든 필터 업데이트
    if (onFiltersChange) {
      onFiltersChange(filters.brand, filters.category, filters.deal);
    } else {
      // 폴백: 개별 호출 (하위 호환성)
      onBrandChange(filters.brand);
      onCategoryChange(filters.category);
      onDealChange(filters.deal);
    }
  };

  // 활성 필터 개수 계산
  const activeFilterCount = [
    selectedBrand !== "ALL",
    selectedCategory !== "ALL",
    selectedDeal !== "ALL",
  ].filter(Boolean).length;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="px-3 py-3">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">편털</span>
            </div>
            <h1 className="text-base font-bold text-gray-900">편의점 털기</h1>
          </div>

          {/* 우측 버튼들 */}
          <div className="flex items-center gap-2">
            {/* 필터 버튼 */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5 text-gray-600" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* 검색 버튼 */}
            <button
              onClick={() => router.push("/search", { scroll: false })}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
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
      </div>

      {/* 날짜 필터 */}
      <DateRangeFilter
        initialStartDate={initialStartDate}
        initialEndDate={initialEndDate}
        onDateRangeChange={onDateRangeChange}
      />

      {/* 필터 바텀시트 */}
      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedBrand={selectedBrand}
        selectedCategory={selectedCategory}
        selectedDeal={selectedDeal}
        onApply={handleFilterApply}
      />
    </header>
  );
}

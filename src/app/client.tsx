"use client";

import Header from "@/components/layout/Header";
import PromotionList from "@/components/PromotionList";
import { Promotion } from "@/types/promotion";
import React, { useState, useEffect } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import { useRouter, useSearchParams } from "next/navigation";

interface ClientProps {
  initialData: Promotion[];
  defaultStartDate: string;
  defaultEndDate: string;
  initialBrand: string;
  initialCategory: string;
  initialDeal: string;
  initialSort: string;
}

export default function Client({
  initialData,
  defaultStartDate,
  defaultEndDate,
  initialBrand,
  initialCategory,
  initialDeal,
  initialSort,
}: ClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 쿼리가 없고 로컬 스토리지에 저장된 필터가 있으면 사용
  const getInitialFilters = () => {
    // URL 쿼리가 있으면 우선 사용
    if (initialBrand !== "ALL" || initialCategory !== "ALL" || initialDeal !== "ALL" || initialSort !== "saved") {
      return { brand: initialBrand, category: initialCategory, deal: initialDeal, sort: initialSort };
    }

    // 로컬 스토리지 확인
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("promo-filters");
        if (stored) {
          const filters = JSON.parse(stored);
          return {
            brand: filters.brand || "ALL",
            category: filters.category || "ALL",
            deal: filters.deal || "ALL",
            sort: filters.sort || "saved",
          };
        }
      } catch (error) {
        console.error("Failed to load filters from localStorage:", error);
      }
    }

    // 기본값
    return { brand: "ALL", category: "ALL", deal: "ALL", sort: "saved" };
  };

  const initialFilters = getInitialFilters();
  const [selectedBrand, setSelectedBrand] = useState<string>(initialFilters.brand);
  const [selectedDeal, setSelectedDeal] = useState<string>(initialFilters.deal);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilters.category);
  const [selectedSort, setSelectedSort] = useState<string>(initialFilters.sort);

  const [selectedDateRange, setSelectedDateRange] = useState({
    start: defaultStartDate,
    end: defaultEndDate,
  });

  // URL 및 로컬 스토리지 업데이트 함수
  const updateURL = (
    brand: string,
    category: string,
    deal: string,
    sort: string
  ) => {
    const params = new URLSearchParams(searchParams);

    // 필터 값 설정
    if (brand !== "ALL") {
      params.set("brand", brand);
    } else {
      params.delete("brand");
    }

    if (category !== "ALL") {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    if (deal !== "ALL") {
      params.set("deal", deal);
    } else {
      params.delete("deal");
    }

    if (sort !== "saved") {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : "/";
    router.replace(newUrl, { scroll: false });

    // 로컬 스토리지에 필터 저장
    try {
      localStorage.setItem(
        "promo-filters",
        JSON.stringify({ brand, category, deal, sort })
      );
    } catch (error) {
      console.error("Failed to save filters to localStorage:", error);
    }
  };

  // 필터 변경 핸들러 (한 번에 모두 처리)
  const handleFiltersChange = (brand: string, category: string, deal: string, sort: string) => {
    setSelectedBrand(brand);
    setSelectedCategory(category);
    setSelectedDeal(deal);
    setSelectedSort(sort);
    updateURL(brand, category, deal, sort);
  };

  const handleBrandChange = (brand: string) => {
    handleFiltersChange(brand, selectedCategory, selectedDeal, selectedSort);
  };

  const handleCategoryChange = (category: string) => {
    handleFiltersChange(selectedBrand, category, selectedDeal, selectedSort);
  };

  const handleDealChange = (deal: string) => {
    handleFiltersChange(selectedBrand, selectedCategory, deal, selectedSort);
  };

  // 초기 로드 시 로컬 스토리지 필터를 URL에 반영
  useEffect(() => {
    if (initialBrand === "ALL" && initialCategory === "ALL" && initialDeal === "ALL" && initialSort === "saved") {
      if (initialFilters.brand !== "ALL" || initialFilters.category !== "ALL" || initialFilters.deal !== "ALL" || initialFilters.sort !== "saved") {
        updateURL(initialFilters.brand, initialFilters.category, initialFilters.deal, initialFilters.sort);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header
        selectedDeal={selectedDeal}
        selectedBrand={selectedBrand}
        selectedCategory={selectedCategory}
        selectedSort={selectedSort}
        onBrandChange={handleBrandChange}
        onDealChange={handleDealChange}
        onCategoryChange={handleCategoryChange}
        onFiltersChange={handleFiltersChange}
        onDateRangeChange={(start, end) => setSelectedDateRange({ start, end })}
        initialStartDate={defaultStartDate}
        initialEndDate={defaultEndDate}
      />

      {/* 메인 콘텐츠 */}
      <main className="px-3 pb-16">
        <PromotionList
          initialData={initialData}
          filters={{
            brandName: selectedBrand,
            dealType: selectedDeal,
            category: selectedCategory,
            startDate: selectedDateRange.start,
            endDate: selectedDateRange.end,
            orderBy: selectedSort === "saved" ? "saved_count" : "start_date",
          }}
        />
      </main>
      <ScrollToTop />
    </>
  );
}

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Promotion } from "@/types/promotion";
import PromoCardEnhanced from "@/components/promo-card";
import { createClient } from "@/lib/supabase/client";
import { usePromotions } from "@/hooks/use-promotions";
import ScrollToTop from "@/components/ScrollToTop";
import ComparisonView from "@/components/ComparisonView";

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<{
    comparison: Promotion[];
    lowestPrice: number | null;
  } | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const ITEMS_PER_PAGE = 20;

  // 통합 훅 사용
  const {
    promos: searchResults,
    loadingMore,
    hasMore,
    loadMoreRef,
    savedPromoIds,
    handleSaveToggle,
    resetData,
  } = usePromotions({
    initialData: [],
    fetchData: async (page: number) => {
      const supabase = createClient();
      const { data } = await supabase
        .from("promo_with_brand")
        .select("*")
        .ilike("title", `%${searchQuery}%`)
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

      const results = (data as Promotion[]) || [];
      return {
        data: results,
        hasMore: results.length === ITEMS_PER_PAGE,
      };
    },
  });

  // 페이지 닫기 (홈으로 이동)
  const handleClose = () => {
    router.push("/");
  };

  // 디바운싱된 자동완성 검색
  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    resetData([]);
    // 이전 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (!value.trim()) {
        setSearchSuggestions([]);
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from("promo_with_brand")
        .select("title")
        .ilike("title", `%${value}%`)
        .limit(5);

      setSearchSuggestions(data?.map((item) => item.title) || []);
    }, 1000);
  };

  // 검색 버튼
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchSuggestions([]); // 검색 시 제안 목록 초기화
    setSearchQuery(query);
    setShowComparison(false); // 새 검색 시 비교 뷰 닫기

    const supabase = createClient();
    const { data } = await supabase
      .from("promo_with_brand")
      .select("*")
      .ilike("title", `%${query}%`)
      .range(0, ITEMS_PER_PAGE - 1);

    const results = (data as Promotion[]) || [];
    resetData(results);
    setIsSearching(false);
  };

  // 편의점별 비교
  const handleCompare = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `/api/promotions/compare?query=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch comparison");
      }

      const data = await response.json();
      setComparisonData({
        comparison: data.comparison,
        lowestPrice: data.lowestPrice,
      });
      setShowComparison(true);
    } catch (error) {
      console.error("Comparison error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={handleClose}
            className="p-2 -m-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
              placeholder="상품명, 브랜드 검색"
              className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchSuggestions([]);
                  resetData([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
              >
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <button
            onClick={() => handleSearch(searchQuery)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            검색
          </button>
        </div>
      </div>

      {/* 검색 자동완성 제안 */}
      {searchSuggestions.length > 0 && !isSearching && (
        <div className="border-b border-gray-200">
          <div className="py-2">
            {searchSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSearch(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-4 h-4 text-gray-400"
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
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 검색 결과 */}
      <div className="p-4">
        {isSearching ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : showComparison && comparisonData ? (
          <ComparisonView
            query={searchQuery}
            comparison={comparisonData.comparison}
            lowestPrice={comparisonData.lowestPrice}
            onClose={() => setShowComparison(false)}
          />
        ) : searchResults.length > 0 ? (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  검색 결과 {searchResults.length}개{hasMore ? "+" : ""}
                </p>
                <button
                  onClick={handleCompare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  편의점별 비교
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {searchResults.map((promo: Promotion) => (
                <PromoCardEnhanced
                  key={promo.id}
                  promotion={promo}
                  isSaved={savedPromoIds.has(promo.id)}
                  onSaveToggle={handleSaveToggle}
                />
              ))}
            </div>

            {/* 무한스크롤 트리거 */}
            <div ref={loadMoreRef} className="py-4">
              {loadingMore && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
              {!hasMore && searchResults.length > 0 && (
                <p className="text-center text-gray-500 text-sm">
                  모든 검색 결과를 불러왔습니다
                </p>
              )}
            </div>
          </>
        ) : searchQuery && !isSearching ? (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500">
              &quot;{searchQuery}&quot; 검색 결과가 없습니다
            </p>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">
              찾고 싶은 상품이나 브랜드를 검색해보세요
            </p>
          </div>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
}

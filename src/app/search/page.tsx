"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PromotionService } from "@/services/promotion/promotion.service";
import { Promotion } from "@/types/promotion";
import PromoCard from "@/components/PromoCard";

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Promotion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 페이지 닫기 (홈으로 이동)
  const handleClose = () => {
    router.push("/");
  };

  // 디바운싱된 자동완성 검색
  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setSearchResults([]); // 입력 중에는 이전 검색 결과 초기화

    // 이전 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const { data } = await PromotionService.fetchSearchSuggestions(value, 5);
      setSearchSuggestions(data || []);
    }, 1000);
  };

  // 검색 버튼
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchSuggestions([]); // 검색 시 제안 목록 초기화
    setSearchQuery(query);

    const { data } = await PromotionService.fetchSearchPromotions(query, 50);

    setSearchResults(data || []);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
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
              onKeyPress={(e) => e.key === "Enter" && handleSearch(searchQuery)}
              placeholder="상품명, 브랜드 검색"
              className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchSuggestions([]);
                  setSearchResults([]);
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
        ) : searchResults.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">
              검색 결과 {searchResults.length}개
            </p>
            {searchResults.map((promo) => (
              <PromoCard key={promo.id} promotion={promo} />
            ))}
          </div>
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
            <p className="text-gray-500">&quot;{searchQuery}&quot; 검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">
              찾고 싶은 상품이나 브랜드를 검색해보세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
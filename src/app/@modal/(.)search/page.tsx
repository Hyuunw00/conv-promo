"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Promotion } from "@/types/promotion";
import PromoCardEnhanced from "@/components/PromoCardEnhanced";
import { getCurrentUser } from "@/lib/auth";
import { toggleSavePromo } from "@/app/actions/saved-actions";

export default function SearchModal() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Promotion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [savedPromoIds, setSavedPromoIds] = useState<Set<string>>(new Set());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 사용자 정보 및 저장된 프로모션 확인
  useEffect(() => {
    const checkUser = async () => {
      const { user: currentUser } = await getCurrentUser();
      setUser(currentUser);

      if (currentUser?.email) {
        try {
          const response = await fetch("/api/saved/ids");
          const result = await response.json();

          if (result.data && Array.isArray(result.data)) {
            const savedSet = new Set(result.data);
            setSavedPromoIds(savedSet as Set<string>);
          }
        } catch (error) {
          console.error("Error fetching saved promo ids:", error);
        }
      }
    };
    checkUser();
  }, []);

  // 저장 토글 핸들러
  const handleSaveToggle = useCallback(
    async (promoId: string) => {
      if (!user?.email) {
        alert("로그인이 필요합니다.");
        return;
      }

      try {
        const result = await toggleSavePromo(user.email, promoId);
        if (result.success) {
          setSavedPromoIds((prev) => {
            const newSet = new Set(prev);
            if (result.saved) {
              newSet.add(promoId);
            } else {
              newSet.delete(promoId);
            }
            return newSet;
          });
        }
      } catch (error) {
        console.error("Error toggling save:", error);
      }
    },
    [user]
  );

  // 모달 닫기
  const handleClose = () => {
    router.back();
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

    const supabase = createClient();
    const { data } = await supabase
      .from("promo_with_brand")
      .select("*")
      .ilike("title", `%${query}%`)
      .limit(50);

    setSearchResults((data as Promotion[]) || []);
    setIsSearching(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center">
      {/* 배경 오버레이 - 뒷배경이 보이도록 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={handleClose}
      />

      {/* 모달 콘텐츠 - 상단에 위치, 적절한 크기 */}
      <div className="relative w-full max-w-md mt-20 mx-4 min-h-[500px] max-h-[70vh] bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-slide-down flex flex-col">
        {/* 검색 헤더 */}
        <div className="sticky top-0 z-10 bg-white border-b">
          <div className="flex items-center gap-3 p-4">
            <button onClick={handleClose} className="p-1">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSearch(searchQuery)
                }
                placeholder="상품명, 브랜드, 카테고리 검색"
                className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />

              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchSuggestions([]);
                    setSearchResults([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
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
              disabled={!searchQuery.trim()}
              className="px-4 py-2 text-sm font-medium text-blue-600 disabled:text-gray-400"
            >
              검색
            </button>
          </div>

          {/* 자동완성 드롭다운 - 개선된 UI */}
          {searchSuggestions.length > 0 &&
            searchResults.length === 0 &&
            !isSearching && (
              <div className="border-t bg-gray-50">
                <div className="px-4 py-2">
                  <p className="text-xs text-gray-500 font-medium mb-1">
                    추천 검색어
                  </p>
                </div>
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-white flex items-center gap-3 group border-b border-gray-100 last:border-0"
                  >
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:bg-blue-50">
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-blue-500"
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
                    <span className="flex-1 text-sm text-gray-700 group-hover:text-gray-900">
                      {suggestion
                        .split(new RegExp(`(${searchQuery})`, "gi"))
                        .map((part, i) =>
                          part.toLowerCase() === searchQuery.toLowerCase() ? (
                            <span
                              key={i}
                              className="font-semibold text-blue-600"
                            >
                              {part}
                            </span>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-300 group-hover:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            )}
        </div>

        {/* 검색 결과 */}
        <div className="flex-1 overflow-y-auto">
          {(isSearching ||
            searchResults.length > 0 ||
            (searchQuery &&
              searchSuggestions.length === 0 &&
              !isSearching)) && (
            <div className="p-4">
              {isSearching ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    검색 결과 {searchResults.length}개
                  </p>
                  <div className="space-y-3">
                    {searchResults.map((promo) => (
                      <PromoCardEnhanced
                        key={promo.id}
                        promotion={promo}
                        isSaved={savedPromoIds.has(promo.id)}
                        onSaveToggle={handleSaveToggle}
                      />
                    ))}
                  </div>
                </>
              ) : (
                searchQuery && (
                  <div className="text-center py-20">
                    <svg
                      className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
                    <p className="text-gray-500">
                      "{searchQuery}" 검색 결과가 없습니다
                    </p>
                  </div>
                )
              )}
            </div>
          )}

          {!isSearching &&
            searchResults.length === 0 &&
            !searchSuggestions.length &&
            !searchQuery && (
              <div className="p-6 text-center text-gray-400 text-sm">
                검색어를 입력하세요
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
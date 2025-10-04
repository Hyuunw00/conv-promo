"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useInfinitePromotions } from "@/hooks/useInfinitePromotions";
import PromoCardEnhanced from "@/components/PromoCardEnhanced";
import Loading from "@/components/ui/Loading";
import { Promotion } from "@/types/promotion";
import { getCurrentUser } from "@/lib/auth";
import { toggleSavePromo } from "@/app/actions/saved-actions";

interface PromotionListProps {
  initialData: Promotion[];
  filters: {
    brandName: string;
    dealType: string;
    startDate: string;
    endDate: string;
  };
}

export default function PromotionList({
  initialData,
  filters,
}: PromotionListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [savedPromoIds, setSavedPromoIds] = useState<Set<string>>(new Set());

  // 무한스크롤 훅 사용 (초기 데이터 전달)
  const { promos, loading, loadingMore, hasMore, fetchMore } =
    useInfinitePromotions({
      initialData,
      ...filters,
    });

  // 사용자 정보 및 저장된 프로모션 확인
  useEffect(() => {
    const checkUser = async () => {
      const { user: currentUser } = await getCurrentUser();
      setUser(currentUser);

      // 저장된 프로모션 목록 가져오기
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
  }, []); // filters를 dependency에서 제거하여 필터 변경 시에도 유지

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

  if (loading) {
    return <Loading />;
  }

  if (!loading && promos.length === 0) {
    return (
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
    );
  }

  return (
    <>
      <div className="space-y-3">
        {promos.map((promo) => (
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
        {loadingMore && <Loading />}
        {!hasMore && promos.length > 0 && (
          <p className="text-center text-gray-500 text-sm">
            모든 프로모션을 불러왔습니다
          </p>
        )}
      </div>
    </>
  );
}

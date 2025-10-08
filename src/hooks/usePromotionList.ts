import { useState, useEffect, useRef, useCallback } from "react";
import { Promotion } from "@/types/promotion";
import { getCurrentUser } from "@/lib/auth";
import { toggleSavePromo } from "@/app/actions/saved-actions";

interface UsePromotionListOptions {
  initialData?: Promotion[];
  fetchData: (page: number) => Promise<{ data: Promotion[]; hasMore: boolean }>;
  itemsPerPage?: number;
}

/**
 * 프로모션 리스트 관리 통합 훅
 * - 무한스크롤
 * - 저장 토글 기능
 * - 데이터 로딩 상태 관리
 */
export function usePromotionList({
  initialData = [],
  fetchData,
  itemsPerPage = 10,
}: UsePromotionListOptions) {
  // 데이터 상태
  const [promos, setPromos] = useState<Promotion[]>(initialData);
  const [page, setPage] = useState(initialData.length > 0 ? 1 : 0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);

  // 저장 기능 상태
  const [user, setUser] = useState<any>(null);
  const [savedPromoIds, setSavedPromoIds] = useState<Set<string>>(new Set());

  // 무한스크롤 ref
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 사용자 정보 및 저장된 프로모션 확인
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();
        setUser(currentUser);

        if (currentUser?.email) {
          const response = await fetch("/api/saved/ids");
          const result = await response.json();

          if (result.data && Array.isArray(result.data)) {
            const savedSet = new Set(result.data);
            setSavedPromoIds(savedSet as Set<string>);
          }
        }
      } catch (error) {
        console.error("Error fetching saved promo ids:", error);
      }
    };
    checkUser();
  }, []);

  // 저장 토글 핸들러
  const handleSaveToggle = useCallback(
    async (promoId: string) => {
      if (!user?.email) {
        alert("로그인이 필요합니다.");
        return { success: false, saved: false };
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
        return result;
      } catch (error) {
        console.error("Error toggling save:", error);
        return { success: false, saved: false };
      }
    },
    [user]
  );

  // 더 많은 데이터 로드
  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    try {
      const result = await fetchData(page);

      if (result.data && result.data.length > 0) {
        setPromos((prev) => {
          // 중복 제거
          const existingIds = new Set(prev.map((p) => p.id));
          const newData = result.data.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newData];
        });
        setPage((prev) => prev + 1);
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more promotions:", error);
      setHasMore(false);
    }

    setLoadingMore(false);
  }, [page, hasMore, loadingMore, fetchData]);

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

  // 데이터 리셋 (필터 변경 시 사용)
  const resetData = useCallback((newData: Promotion[] = []) => {
    setPromos(newData);
    setPage(newData.length > 0 ? 1 : 0);
    setHasMore(true);
  }, []);

  return {
    // 데이터
    promos,
    loading,
    loadingMore,
    hasMore,

    // 저장 기능
    user,
    savedPromoIds,
    handleSaveToggle,

    // 무한스크롤
    loadMoreRef,
    fetchMore,

    // 유틸리티
    resetData,
  };
}

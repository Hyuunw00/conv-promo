import { useState, useEffect, useCallback } from "react";
import { Promotion } from "@/types/promotion";

interface UseInfinitePromotionsOptions {
  initialData?: Promotion[];
  brandName?: string;
  dealType?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export function useInfinitePromotions({
  initialData,
  brandName,
  dealType,
  category,
  startDate,
  endDate,
}: UseInfinitePromotionsOptions) {
  const [promos, setPromos] = useState<Promotion[]>(initialData || []);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialData ? 1 : 0);

  const ITEMS_PER_PAGE = 5;

  // 초기 로드 또는 필터 변경시
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (brandName) params.append('brandName', brandName);
      if (dealType) params.append('dealType', dealType);
      if (category) params.append('category', category);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('limit', String(ITEMS_PER_PAGE));
      params.append('offset', '0');

      const response = await fetch(`/api/promotions?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch promotions');
      }

      setPromos(result.data || []);
      setHasMore(result.hasMore || false);
    } catch (error) {
      setError(error as Error);
      setPromos([]);
    }

    setPage(1);
    setLoading(false);
  }, [brandName, dealType, category, startDate, endDate]);

  // 더 많은 데이터 로드 (스크롤시)
  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    try {
      const params = new URLSearchParams();
      if (brandName) params.append('brandName', brandName);
      if (dealType) params.append('dealType', dealType);
      if (category) params.append('category', category);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('limit', String(ITEMS_PER_PAGE));
      params.append('offset', String(page * ITEMS_PER_PAGE));

      const response = await fetch(`/api/promotions?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch more promotions');
      }

      if (result.data) {
        setPromos((prev) => {
          // 기존 ID Set 생성
          const existingIds = new Set(prev.map(p => p.id));
          // 중복되지 않은 새 데이터만 필터링
          const newData = result.data.filter((p: Promotion) => !existingIds.has(p.id));
          return [...prev, ...newData];
        });
        setHasMore(result.hasMore || false);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      setError(error as Error);
    }

    setLoadingMore(false);
  }, [page, hasMore, loadingMore, brandName, dealType, category, startDate, endDate]);

  // 필터 변경시 데이터 리셋
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchInitialData();
  }, [brandName, dealType, category, startDate, endDate]);

  return {
    promos,
    loading,
    loadingMore,
    error,
    hasMore,
    fetchMore,
  };
}

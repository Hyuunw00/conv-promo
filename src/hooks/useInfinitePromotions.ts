import { useState, useEffect, useCallback } from "react";
import { Promotion } from "@/types/promotion";
import { PromotionService } from "@/services/promotion/promotion.service";

interface UseInfinitePromotionsOptions {
  initialData?: Promotion[];
  brandName?: string;
  dealType?: string;
  startDate?: string;
  endDate?: string;
}

export function useInfinitePromotions({
  initialData,
  brandName,
  dealType,
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

    const { data, error, hasMore } = await PromotionService.fetchPromotions({
      brandName: brandName,
      dealType: dealType,
      startDate: startDate,
      endDate: endDate,
      limit: ITEMS_PER_PAGE,
      offset: 0,
    });

    if (error) {
      setError(error);
      setPromos([]);
    } else {
      setPromos(data || []);
      setHasMore(hasMore || false);
    }

    setPage(1);
    setLoading(false);
  }, [brandName, dealType, startDate, endDate]);

  // 더 많은 데이터 로드 (스크롤시)
  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    const {
      data,
      error,
      hasMore: moreAvailable,
    } = await PromotionService.fetchPromotions({
      brandName: brandName,
      dealType: dealType,
      startDate: startDate,
      endDate: endDate,
      limit: ITEMS_PER_PAGE,
      offset: page * ITEMS_PER_PAGE,
    });

    if (error) {
      setError(error);
    } else if (data) {
      setPromos((prev) => [...prev, ...data]);
      setHasMore(moreAvailable || false);
      setPage((prev) => prev + 1);
    }

    setLoadingMore(false);
  }, [page, hasMore, loadingMore, brandName, dealType, startDate, endDate]);

  // 필터 변경시 데이터 리셋
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchInitialData();
  }, [brandName, dealType, startDate, endDate]);

  return {
    promos,
    loading,
    loadingMore,
    error,
    hasMore,
    fetchMore,
  };
}

import { useState, useEffect, useRef, useCallback } from "react";
import {
  PromotionService,
  type FetchPromotionsParams,
} from "@/services/promotion.service";
import type { Promotion } from "@/types/promotion";

export function usePromotions(params: FetchPromotionsParams = {}) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchPromotions = useCallback(
    async (pageNum: number, isInitial: boolean) => {
      try {
        if (isInitial) setInitialLoading(true);
        else setLoadingMore(true);

        const {
          data,
          error,
          hasMore: more,
        } = await PromotionService.fetchPromotions({
          ...params,
          offset: pageNum * 20,
          limit: 20,
        });

        if (error) throw error;

        setPromotions((prev) => {
          if (isInitial) return data || [];
          const existingIds = new Set(prev.map((p) => p.id));
          const newData = (data || []).filter((p) => !existingIds.has(p.id));
          return [...prev, ...newData];
        });

        setHasMore(more || false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    },
    [params.brandName, params.category, params.dealType, params.search],
  );

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchPromotions(0, true);
  }, [params.brandName, params.category, params.dealType, params.search]);

  useEffect(() => {
    if (page > 0) {
      fetchPromotions(page, false);
    }
  }, [page, fetchPromotions]);

  useEffect(() => {
    if (initialLoading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [initialLoading, loadingMore, hasMore]);

  return {
    promotions,
    initialLoading,
    loadingMore,
    error,
    hasMore,
    loadMoreRef,
  };
}

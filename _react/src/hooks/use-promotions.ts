import { useEffect, useRef, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  PromotionService,
  type FetchPromotionsParams,
} from "@/services/promotion.service";

const PAGE_SIZE = 20;

export function usePromotions(params: FetchPromotionsParams = {}) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: initialLoading,
    isFetching,
    isPlaceholderData,
  } = useInfiniteQuery({
    queryKey: ["promotions", params],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error, hasMore } = await PromotionService.fetchPromotions({
        ...params,
        offset: pageParam * PAGE_SIZE,
        limit: PAGE_SIZE,
      });

      if (error) throw error;
      return {
        data: data || [],
        nextOffset: hasMore ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    // 필터 변경 시 이전 데이터를 유지하여 Skeleton Flash 방지
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const promotions = useMemo(() => {
    const allItems = data?.pages.flatMap((page) => page.data) || [];
    const seen = new Set();
    return allItems.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [data]);

  useEffect(() => {
    if (initialLoading || isFetchingNextPage || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [initialLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  return {
    promotions,
    initialLoading: initialLoading && !isPlaceholderData,
    loadingMore: isFetchingNextPage, // 페이지 하단 로딩 스피너
    isFetching: isFetching && !isFetchingNextPage, // 페이지 상단 로딩 바
    error: error as Error | null,
    hasMore: hasNextPage,
    loadMoreRef,
  };
}

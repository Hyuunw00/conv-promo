import { useState } from "react";
import { usePromotions } from "@/hooks/use-promotions";
import type { FetchPromotionsParams } from "@/services/promotion.service";
import PromoCard from "@/components/promotion/promo-card";
import PromoCardSkeleton from "@/components/promotion/promo-card-skeleton";
import HomeHeader from "@/components/layout/home-header";
import FilterBottomSheet from "@/components/filter-bottom-sheet";

export default function Home() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 필터 상태
  const [filters, setFilters] = useState<FetchPromotionsParams>({
    brandName: "ALL",
    category: "ALL",
    dealType: "ALL",
    orderBy: "created_at", // 최신순
  });

  // 프로모션 목록 커스텀 훅
  const {
    promotions,
    initialLoading,
    loadingMore,
    isFetching,
    error,
    hasMore,
    loadMoreRef,
  } = usePromotions(filters);

  const activeFilterCount = [
    filters.brandName !== "ALL",
    filters.category !== "ALL",
    filters.dealType !== "ALL",
    filters.orderBy !== "created_at",
  ].filter(Boolean).length;

  const handleFilterApply = (newFilters: FetchPromotionsParams) => {
    setFilters(newFilters);
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">Error: {error.message}</div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HomeHeader
        selectedBrand={filters.brandName || "ALL"}
        onBrandChange={(brandName) =>
          setFilters((prev) => ({ ...prev, brandName }))
        }
        activeFilterCount={activeFilterCount}
        onFilterClick={() => setIsFilterOpen(true)}
      />

      <div className="flex-1 px-4 py-6 relative">
        {/* 필터 변경 시 상단 로딩 바 */}
        {isFetching && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 overflow-hidden z-10">
            <div className="h-full bg-blue-500 animate-progress origin-left" />
          </div>
        )}

        <div className="flex flex-col gap-6">
          {initialLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <PromoCardSkeleton key={`skeleton-${i}`} />
              ))
            : promotions.map((promotion) => (
                <PromoCard key={promotion.id} promotion={promotion} />
              ))}
        </div>

        {!initialLoading && (
          <div
            ref={loadMoreRef}
            className="mt-8 flex justify-center items-center h-20"
          >
            {/* 스크롤시 하단 로딩 스피너 */}
            {loadingMore && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            )}
            {!hasMore && promotions.length > 0 && (
              <p className="text-gray-500 text-sm">모든 상품을 불러왔습니다.</p>
            )}
          </div>
        )}

        {!initialLoading && promotions.length === 0 && (
          <div className="text-center text-gray-500 py-20 bg-gray-100/50 rounded-2xl">
            <p className="text-lg font-medium text-gray-400">
              등록된 상품이 없습니다.
            </p>
          </div>
        )}
      </div>

      {isFilterOpen && (
        <FilterBottomSheet
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          selectedFilters={filters}
          onApply={handleFilterApply}
        />
      )}
    </div>
  );
}

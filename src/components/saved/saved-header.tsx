import Link from "next/link";
import React from "react";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { Heart } from "lucide-react";
import { Promotion } from "@/types/promotion";

interface SavedHeaderProps {
  isEditMode: boolean;
  totalCount: number;
  selectedPromoIds: Set<string>;
  setSelectedPromoIds: (selectedPromoIds: Set<string>) => void;
  setIsFilterOpen: (isOpen: boolean) => void;
  setIsEditMode: (isEditMode: boolean) => void;
  handleSelectAll: () => void;
  handleBulkDelete: () => void;
  activeFilterCount: number;
  displayedPromos: Promotion[];
}

export default function SavedHeader({
  isEditMode,
  totalCount,
  selectedPromoIds,
  setSelectedPromoIds,
  setIsFilterOpen,
  setIsEditMode,
  handleSelectAll,
  handleBulkDelete,
  activeFilterCount,
  displayedPromos,
}: SavedHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            {!isEditMode ? (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  <Heart className="inline-block w-5 h-5 mr-1 text-red-500 fill-red-500" />
                  저장한 프로모션
                </h1>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {totalCount > 0
                    ? `${totalCount}개의 프로모션을 저장했어요`
                    : "나중에 보고 싶은 프로모션을 저장하세요"}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900">편집</h1>
                {selectedPromoIds.size > 0 && (
                  <span className="text-sm text-gray-600">
                    ({selectedPromoIds.size}개 선택)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 우측 버튼들 */}
          <div className="flex items-center gap-2">
            {!isEditMode ? (
              <>
                {/* 필터 버튼 */}
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                {/* 편집 버튼 */}
                {displayedPromos.length > 0 && (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    편집
                  </button>
                )}
              </>
            ) : (
              <>
                {/* 전체 선택 버튼 */}
                <button
                  onClick={handleSelectAll}
                  className="px-2 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
                >
                  {selectedPromoIds.size === displayedPromos.length
                    ? "해제"
                    : "전체"}
                </button>
                {/* 삭제 버튼 */}
                {selectedPromoIds.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-2 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
                  >
                    삭제
                  </button>
                )}
                {/* 취소 버튼 */}
                <button
                  onClick={() => {
                    setIsEditMode(false);
                    setSelectedPromoIds(new Set());
                  }}
                  className="px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  취소
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

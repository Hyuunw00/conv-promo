import { useState, useEffect } from "react";
import { BRAND_LIST, BRAND_INFO } from "@/constants/brands";
import { DEAL_TYPE_INFO } from "@/constants/deals";
import { X } from "lucide-react";
import type { UnifiedCategory } from "@/types/category";
import { UNIFIED_CATEGORIES } from "@/constants/category";
import type { FetchPromotionsParams } from "@/services/promotion.service";

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFilters: FetchPromotionsParams;
  onApply: (filters: FetchPromotionsParams) => void;
}

const categoryConfig: Record<UnifiedCategory, { icon: string; label: string }> =
  {
    "식품/간편식": { icon: "🍱", label: "식품" },
    "과자/스낵": { icon: "🍪", label: "과자" },
    음료: { icon: "🥤", label: "음료" },
    생활용품: { icon: "🧴", label: "생활" },
    기타: { icon: "📦", label: "기타" },
  };

export default function FilterBottomSheet({
  isOpen,
  onClose,
  selectedFilters,
  onApply,
}: FilterBottomSheetProps) {
  const [tempFilters, setTempFilters] = useState({
    brandName: selectedFilters.brandName,
    category: selectedFilters.category,
    dealType: selectedFilters.dealType,
    orderBy: selectedFilters.orderBy,
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleApply = () => {
    onApply(tempFilters);
    onClose();
  };

  const handleReset = () => {
    setTempFilters({
      brandName: "ALL",
      category: "ALL",
      dealType: "ALL",
      orderBy: "created_at",
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/40 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-2xl flex flex-col max-w-md mx-auto shadow-2xl animate-in slide-in-from-bottom duration-300"
        style={{ maxHeight: "calc(100vh - 80px)" }}
      >
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-bold">필터</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto p-4 space-y-6"
          style={{ overscrollBehavior: "contain" }}
        >
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              편의점 브랜드
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {BRAND_LIST.map((brandId) => {
                const info = BRAND_INFO[brandId as keyof typeof BRAND_INFO];
                return (
                  <button
                    key={brandId}
                    onClick={() =>
                      setTempFilters((prev) => ({
                        ...prev,
                        brandName: brandId,
                      }))
                    }
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                      tempFilters.brandName === brandId
                        ? "bg-gray-900 text-white ring-2 ring-gray-900"
                        : `${info.bgColor} ${info.textColor} hover:opacity-80`
                    }`}
                  >
                    {info.logo && (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <img
                          src={info.logo}
                          alt={info.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <span className="text-xs font-medium">{info.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              카테고리
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  setTempFilters((prev) => ({ ...prev, category: "ALL" }))
                }
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  tempFilters.category === "ALL"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                전체
              </button>
              {UNIFIED_CATEGORIES.map((category) => {
                const config = categoryConfig[category];
                return (
                  <button
                    key={category}
                    onClick={() =>
                      setTempFilters((prev) => ({
                        ...prev,
                        category: category,
                      }))
                    }
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      tempFilters.category === category
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              행사 종류
            </h3>
            <div className="flex flex-wrap gap-2">
              {DEAL_TYPE_INFO.map((dealType) => (
                <button
                  key={dealType.id}
                  onClick={() =>
                    setTempFilters((prev) => ({
                      ...prev,
                      dealType: dealType.id,
                    }))
                  }
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    tempFilters.dealType === dealType.id
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  <span>{dealType.icon}</span>
                  <span>{dealType.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">정렬</h3>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setTempFilters((prev) => ({
                    ...prev,
                    orderBy: "saved_count",
                  }))
                }
                className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  tempFilters.orderBy === "saved_count"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                저장순
              </button>
              <button
                onClick={() =>
                  setTempFilters((prev) => ({ ...prev, orderBy: "created_at" }))
                }
                className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  tempFilters.orderBy === "created_at"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                최신순
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 pb-20 border-t bg-white flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            >
              초기화
            </button>
            <button
              onClick={handleApply}
              className="flex-[2] py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              적용하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

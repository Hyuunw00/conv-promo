"use client";

import { useState, useEffect } from "react";
import { brands, brandInfo } from "@/constants/brands";
import { UNIFIED_CATEGORIES, UnifiedCategory } from "@/utils/categoryMapper";
import { dealTypes } from "@/constants/deals";
import Image from "next/image";
import { X } from "lucide-react";

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBrand: string;
  selectedCategory: string;
  selectedDeal: string;
  onApply: (filters: { brand: string; category: string; deal: string }) => void;
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
  selectedBrand,
  selectedCategory,
  selectedDeal,
  onApply,
}: FilterBottomSheetProps) {
  const [tempBrand, setTempBrand] = useState(selectedBrand);
  const [tempCategory, setTempCategory] = useState(selectedCategory);
  const [tempDeal, setTempDeal] = useState(selectedDeal);

  // body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleApply = () => {
    onApply({
      brand: tempBrand,
      category: tempCategory,
      deal: tempDeal,
    });
    onClose();
  };

  const handleReset = () => {
    setTempBrand("ALL");
    setTempCategory("ALL");
    setTempDeal("ALL");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/40 z-[100] animate-fade-in"
        onClick={onClose}
      />

      {/* 바텀시트 */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[9999] animate-slide-up flex flex-col max-w-md mx-auto"
        style={{ maxHeight: "calc(100vh - 80px)" }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-bold">필터</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 필터 내용 */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-6"
          style={{ overscrollBehavior: "contain", minHeight: 0 }}
        >
          {/* 브랜드 필터 */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              편의점 브랜드
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {brands.map((brand) => {
                const info = brandInfo[brand as keyof typeof brandInfo];
                return (
                  <button
                    key={brand}
                    onClick={() => setTempBrand(brand)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                      tempBrand === brand
                        ? "bg-gray-900 text-white ring-2 ring-gray-900"
                        : `${info.bgColor} ${info.textColor} hover:opacity-80`
                    }`}
                  >
                    {info.logo && (
                      <div className="w-8 h-8 relative">
                        <Image
                          src={info.logo}
                          alt={info.name}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <span className="text-xs font-medium">{info.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              카테고리
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTempCategory("ALL")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  tempCategory === "ALL"
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
                    onClick={() => setTempCategory(category)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      tempCategory === category
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

          {/* 행사 타입 필터 */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              행사 종류
            </h3>
            <div className="flex flex-wrap gap-2">
              {dealTypes.map((deal) => (
                <button
                  key={deal.id}
                  onClick={() => setTempDeal(deal.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    tempDeal === deal.id
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  <span>{deal.icon}</span>
                  <span>{deal.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="p-4 border-t bg-white flex-shrink-0">
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

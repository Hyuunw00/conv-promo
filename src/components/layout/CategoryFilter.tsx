"use client";

import { UNIFIED_CATEGORIES, UnifiedCategory } from "@/utils/categoryMapper";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categoryConfig: Record<UnifiedCategory, { icon: string; label: string }> =
  {
    "식품/간편식": { icon: "🍱", label: "식품" },
    "과자/스낵": { icon: "🍪", label: "과자" },
    음료: { icon: "🥤", label: "음료" },
    생활용품: { icon: "🧴", label: "생활" },
    기타: { icon: "📦", label: "기타" },
  };

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="sticky top-[176px] z-40 bg-white  px-3 py-2">
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onCategoryChange("ALL")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            selectedCategory === "ALL"
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
              onClick={() => onCategoryChange(category)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
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
  );
}

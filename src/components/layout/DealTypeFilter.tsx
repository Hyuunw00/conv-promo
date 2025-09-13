"use client";

import { DealType } from "@/types/deal";

interface DealTypeFilterProps {
  selectedDeal: DealType;
  onDealChange: (deal: DealType) => void;
}

export default function DealTypeFilter({
  selectedDeal,
  onDealChange,
}: DealTypeFilterProps) {
  const dealTypes = [
    { id: "all", label: "전체" },
    { id: "ONE_PLUS_ONE", label: "1+1" },
    { id: "TWO_PLUS_ONE", label: "2+1" },
    { id: "DISCOUNT", label: "할인" },
  ];

  return (
    <div className="sticky top-[120px] z-40 bg-gray-50 px-3 py-2">
      <div className="flex gap-1.5">
        {dealTypes.map((deal) => (
          <button
            key={deal.id}
            onClick={() => onDealChange(deal.id as DealType)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              selectedDeal === deal.id
                ? "bg-white text-gray-900 shadow-sm"
                : "bg-white/50 text-gray-600"
            }`}
          >
            {deal.label}
          </button>
        ))}
      </div>
    </div>
  );
}

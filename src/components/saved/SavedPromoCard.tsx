"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { removeSavedPromo } from "@/app/actions/saved-actions";

interface SavedPromoCardProps {
  promo: {
    id: string;
    title: string;
    brand_name: string;
    deal_type: string;
    normal_price?: number;
    sale_price?: number;
    start_date: string;
    end_date: string;
    image_url?: string;
  };
  userEmail: string;
}

export function SavedPromoCard({
  promo,
  userEmail,
}: SavedPromoCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeSavedPromo(userEmail, promo.id);
    } catch (error) {
      console.error("Error removing saved promo:", error);
      setIsRemoving(false);
    }
  };

  const getDealTypeLabel = (dealType: string) => {
    switch (dealType) {
      case "ONE_PLUS_ONE":
        return "1+1";
      case "TWO_PLUS_ONE":
        return "2+1";
      case "DISCOUNT":
        return "할인";
      default:
        return dealType;
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all ${
        isRemoving ? "opacity-50" : ""
      }`}
    >
      {promo.image_url && (
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          <img
            src={promo.image_url}
            alt={promo.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
            {promo.brand_name}
          </span>
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart className="w-5 h-5 fill-current" />
          </button>
        </div>

        <h3 className="font-semibold text-lg mb-2">{promo.title}</h3>

        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded">
            {getDealTypeLabel(promo.deal_type)}
          </span>
          {promo.sale_price && (
            <span className="text-sm text-gray-600">
              {promo.sale_price.toLocaleString()}원
            </span>
          )}
        </div>

        <div className="text-sm text-gray-500">
          {promo.start_date} ~ {promo.end_date}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  ChevronDown,
  ChevronUp,
  Calendar,
  Tag,
  Barcode,
  ExternalLink,
  Package,
  Users,
} from "lucide-react";
import { Promotion } from "@/types/promotion";
import { fmtDate } from "@/utils/date";
import BrandBadge from "./BrandBadge";
import DealBadge from "./DealBadge";

interface PromoCardEnhancedProps {
  promotion: Promotion & {
    image_url?: string;
    normal_price?: number;
    barcode?: string;
    source_url?: string;
    raw_title?: string;
    description?: string;
  };
  isSaved?: boolean;
  onSaveToggle?: (promoId: string) => void;
}

export default function PromoCardEnhanced({
  promotion,
  isSaved = false,
  onSaveToggle,
}: PromoCardEnhancedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHearted, setIsHearted] = useState(isSaved);

  // isSaved prop이 변경되면 isHearted 상태 업데이트
  useEffect(() => {
    setIsHearted(isSaved);
  }, [isSaved]);

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHearted(!isHearted);
    onSaveToggle?.(promotion.id);
  };

  const getDiscountRate = () => {
    if (promotion.normal_price && promotion.sale_price) {
      const rate = Math.round(
        ((promotion.normal_price - promotion.sale_price) /
          promotion.normal_price) *
          100
      );
      return rate > 0 ? rate : null;
    }
    return null;
  };

  const discountRate = getDiscountRate();

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* 이미지 섹션 */}
      {promotion.image_url && (
        <div className="relative bg-gray-50 h-56 flex items-center justify-center overflow-hidden">
          <img
            src={promotion.image_url}
            alt={promotion.title}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          {discountRate && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1.5 rounded-lg font-bold text-sm shadow-md">
              {discountRate}% OFF
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* 상단: 브랜드와 행사 유형 */}
        <div className="flex items-center justify-between mb-3">
          <BrandBadge brandName={promotion.brand_name} />
          <div className="flex items-center gap-2">
            <DealBadge dealType={promotion.deal_type} />
            {promotion.saved_count && promotion.saved_count > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-medium">
                <Users className="w-3 h-3" />
                {promotion.saved_count}
              </span>
            )}
            <button
              onClick={handleHeartClick}
              className={`p-1.5 rounded-full transition-all ${
                isHearted
                  ? "bg-red-50 text-red-500"
                  : "bg-gray-50 text-gray-400 hover:bg-gray-100"
              }`}
            >
              <Heart className={`w-5 h-5 ${isHearted ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        {/* 제목 */}
        <h3 className="font-semibold text-gray-900 text-base mb-3 line-clamp-2">
          {promotion.title}
        </h3>

        {/* 가격 정보 */}
        <div className="flex items-baseline gap-3 mb-3">
          {promotion.sale_price && (
            <>
              <div className="text-xl font-bold text-gray-900">
                {promotion.sale_price.toLocaleString()}원
              </div>
              {promotion.normal_price &&
                promotion.normal_price > promotion.sale_price && (
                  <div className="text-sm text-gray-400 line-through">
                    {promotion.normal_price.toLocaleString()}원
                  </div>
                )}
            </>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="space-y-2 mb-3">
          {/* 카테고리 + 기간 */}
          <div className="flex flex-wrap gap-2">
            {promotion.category && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                <Package className="w-3 h-3" />
                {promotion.category}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
              <Calendar className="w-3 h-3" />
              {fmtDate(promotion.start_date)} ~ {fmtDate(promotion.end_date)}
            </span>
          </div>
        </div>

        {/* 확장/축소 버튼 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-1 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span>상세정보</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {/* 드롭다운 추가 정보 */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 transition-all duration-200">
            {promotion.description && (
              <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded">
                {promotion.description}
              </div>
            )}

            {promotion.raw_title && promotion.raw_title !== promotion.title && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">원본 제목:</span>{" "}
                {promotion.raw_title}
              </div>
            )}

            {promotion.barcode && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Barcode className="w-4 h-4" />
                <span className="font-medium">바코드:</span> {promotion.barcode}
              </div>
            )}

            {promotion.source_url && (
              <a
                href={promotion.source_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-3 h-3" />
                원본 페이지에서 보기
              </a>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs text-gray-400">
                <Tag className="inline w-3 h-3 mr-1" />
                ID: {promotion.id.slice(0, 8)}
              </span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

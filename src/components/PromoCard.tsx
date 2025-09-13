import { Promotion } from "@/types/promotion";
import { fmtDate } from "@/utils/date";
import BrandBadge from "./BrandBadge";
import DealBadge from "./DealBadge";

interface PromoCardProps {
  promotion: Promotion;
}

export default function PromoCard({ promotion }: PromoCardProps) {
  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="p-4">
        {/* 상단: 브랜드와 행사 유형 */}
        <div className="flex items-center justify-between mb-3">
          <BrandBadge brandName={promotion.brand_name} />
          <DealBadge dealType={promotion.deal_type} />
        </div>

        {/* 제목 */}
        <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2">
          {promotion.title}
        </h3>

        {/* 하단 정보 */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            {promotion.category && (
              <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                {promotion.category}
              </span>
            )}
            <div className="text-xs text-gray-500">
              {fmtDate(promotion.start_date)} ~ {fmtDate(promotion.end_date)}
            </div>
          </div>
          {promotion.sale_price && (
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {promotion.sale_price.toLocaleString()}
                <span className="text-sm font-normal">원</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

import { Promotion } from "@/types/promotion";
import { fmtDate } from "@/utils/date";
import { DealType } from "@/types/deal";

interface PromoCardProps {
  promotion: Promotion;
}

export default function PromoCard({ promotion }: PromoCardProps) {
  const getDealBadge = (dealType: string | null) => {
    if (!dealType) return null;

    const badges: Record<string, { label: string; style: string }> = {
      ONE_PLUS_ONE: {
        label: "1+1",
        style: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
      },
      TWO_PLUS_ONE: {
        label: "2+1",
        style: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white",
      },
      DISCOUNT: {
        label: "할인",
        style: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
      },
    };

    const badge = badges[dealType];
    if (!badge) return null;

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${badge.style}`}
      >
        {badge.label}
      </span>
    );
  };

  const getBrandBadge = (brand: string) => {
    const brandColors: Record<string, string> = {
      GS25: "bg-blue-100 text-blue-700 border-blue-200",
      CU: "bg-purple-100 text-purple-700 border-purple-200",
      세븐일레븐: "bg-red-100 text-red-700 border-red-200",
      이마트24: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };

    return brandColors[brand] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="p-4">
        {/* 상단: 브랜드와 행사 유형 */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getBrandBadge(
              promotion.brand_name
            )}`}
          >
            {promotion.brand_name}
          </span>
          {getDealBadge(promotion.deal_type)}
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
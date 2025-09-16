import { PromotionService } from "@/services/promotion/promotion.service";
import PromoCard from "@/components/PromoCard";
import PopularClient from "./PopularClient";

interface PopularPageProps {
  searchParams: Promise<{
    filter?: string;
  }>;
}

export default async function PopularPage({ searchParams }: PopularPageProps) {
  const params = await searchParams;
  const timeFilter = (params.filter || "today") as "today" | "week" | "month";

  // 기간별 일수 설정
  let daysAgo = 0;
  switch (timeFilter) {
    case "week":
      daysAgo = 7;
      break;
    case "month":
      daysAgo = 30;
      break;
    default:
      daysAgo = 0;
  }

  // 서버에서 데이터 fetching
  const { data: promos, error } = await PromotionService.fetchPopularPromotions(
    30,
    daysAgo
  );

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">🔥 인기 프로모션</h1>
          <p className="text-xs text-gray-500 mt-0.5">지금 가장 핫한 행사들</p>
        </div>
        <PopularClient initialFilter={timeFilter} />
      </header>

      <main className="px-3 pb-16 pt-3">
        {!promos || promos.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <p className="text-gray-500">아직 인기 프로모션이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {promos.map((promo, index) => (
              <div key={promo.id} className="relative">
                {/* 순위 뱃지 */}
                {index < 3 && (
                  <div className="absolute -top-2 -left-2 z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                          : index === 1
                          ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white"
                          : "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>
                )}
                <PromoCard promotion={promo} />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

import { PromotionService } from "@/services/promotion/promotion.service";
import PromoCardEnhanced from "@/components/PromoCardEnhanced";
import PopularClient from "./PopularClient";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ScrollToTop from "@/components/ScrollToTop";

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

  // 서버에서 초기 데이터만 fetching (10개)
  const { data: initialPromos, error } = await PromotionService.fetchPopularPromotions(
    10,
    daysAgo
  );

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">🔥 인기 프로모션</h1>
              <p className="text-xs text-gray-500 mt-0.5">지금 가장 핫한 행사들</p>
            </div>
          </div>
        </div>
      </header>
      <PopularClient
        initialFilter={timeFilter}
        initialPromos={initialPromos || []}
        daysAgo={daysAgo}
      />
      <ScrollToTop />
    </>
  );
}

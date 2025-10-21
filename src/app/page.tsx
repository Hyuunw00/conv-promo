import { PromotionService } from "@/services/promotion/promotion.service";
import { getKSTDateString, toKST } from "@/utils/date";
import Client from "./client";

export const metadata = {
  title: "홈",
  description:
    "이번 달 편의점 프로모션을 확인하세요. 1+1, 2+1, 할인 행사 정보를 실시간으로 제공합니다.",
  alternates: {
    canonical: "/",
  },
};

interface HomeProps {
  searchParams: Promise<{
    brand?: string;
    category?: string;
    deal?: string;
    sort?: string;
  }>;
}
export default async function HomePage({ searchParams }: HomeProps) {
  const params = await searchParams;

  // URL에서 필터 값 가져오기
  const brandName = params.brand || "ALL";
  const dealType = params.deal || "ALL";
  const category = params.category || "ALL";
  const sort = params.sort || "saved";

  const today = toKST(new Date());

  // 이번 달 1일
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // 이번 달 마지막 날
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const startDate = getKSTDateString(startOfMonth);
  const endDate = getKSTDateString(endOfMonth);

  const orderBy = sort === "saved" ? "saved_count" : "start_date";
  const ascending = false; // 둘 다 내림차순 (saved_count 큰순, start_date 큰순)

  const { data: initialData } = await PromotionService.fetchPromotions({
    brandName,
    dealType,
    category,
    startDate,
    endDate,
    orderBy,
    ascending,
  });

  return (
    <Client
      initialData={initialData || []}
      defaultStartDate={startDate}
      defaultEndDate={endDate}
      initialBrand={brandName}
      initialCategory={category}
      initialDeal={dealType}
      initialSort={sort}
    />
  );
}

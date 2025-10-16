import { PromotionService } from "@/services/promotion/promotion.service";
import { getKSTDateString, toKST } from "@/utils/date";
import Client from "./client";

export const metadata = {
  title: "편의점 프로모션 - 전국 편의점 행사 한눈에",
  description: "GS25, CU, 세븐일레븐, 이마트24 프로모션을 한 곳에서",
};

interface HomeProps {
  searchParams: Promise<{
    brand?: string;
    category?: string;
    deal?: string;
    sort?: string;
  }>;
}

async function getInitialData() {
  const { data: initialData } = await PromotionService.fetchPromotions({
    brandName: "ALL",
    dealType: "ALL",
    category: "ALL",
    startDate: "ALL",
    endDate: "ALL",
  });
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  // URL에서 필터 값 가져오기
  const brandName = params.brand || "ALL";
  const dealType = params.deal || "ALL";
  const category = params.category || "ALL";
  const sort = params.sort || "saved";

  const today = toKST(new Date());
  const defaultEndDate = new Date(today);
  // default: 14일 후 기간
  defaultEndDate.setDate(today.getDate() + 14);

  const startDate = getKSTDateString(today);
  const endDate = getKSTDateString(defaultEndDate);

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

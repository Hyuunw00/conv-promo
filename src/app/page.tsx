import { PromotionService } from "@/services/promotion/promotion.service";
import { getKSTDateString, toKST } from "@/utils/date";
import Client from "./client";

interface HomeProps {
  searchParams: Promise<{
    brand?: string;
    category?: string;
    deal?: string;
    sort?: string;
  }>;
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

  const { data: initialData, error } = await PromotionService.fetchPromotions({
    limit: 5,
    offset: 0,
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

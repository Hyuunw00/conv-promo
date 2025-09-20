import { PromotionService } from "@/services/promotion/promotion.service";
import { getKSTDateString, toKST } from "@/utils/date";
import Client from "./client";

export default async function Home() {
  const today = toKST(new Date());
  const defaultEndDate = new Date(today);
  // default: 14일 후 기간
  defaultEndDate.setDate(today.getDate() + 14);

  const startDate = getKSTDateString(today);
  const endDate = getKSTDateString(defaultEndDate);

  const { data: initialData } = await PromotionService.fetchPromotions({
    limit: 5,
    offset: 0,
    brandName: "ALL",
    dealType: "ALL",
    startDate,
    endDate,
  });

  return (
    <Client
      initialData={initialData || []}
      defaultStartDate={startDate}
      defaultEndDate={endDate}
    />
  );
}

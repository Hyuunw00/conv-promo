import { useEffect } from "react";
import { PromotionService } from "@/services/promotion.service";

export default function Home() {
  useEffect(() => {
    // 테스트: 데이터 패칭 확인
    const fetchData = async () => {
      const result = await PromotionService.fetchPromotions();
      if (result.error) {
        console.error("Error:", result.error);
      } else {
        console.log("Success! Count:", result.data?.length);
      }
    };

    fetchData();
  }, []);

  return <div>Home (Check Console for Data)</div>;
}

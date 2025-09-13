import { useState, useEffect } from "react";
import { Promotion } from "@/types/promotion";
import {
  FetchPromotionsOptions,
  PromotionService,
} from "@/services/promotion/promotion.service";

export function usePromotions(options: FetchPromotionsOptions = {}) {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await PromotionService.fetchPromotions(options);

      if (error) {
        setError(error);
      } else {
        setPromos(data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [options.brandName, options.dealType, options.limit, options.orderBy]);

  return { promos, loading, error };
}

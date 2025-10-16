export interface Promotion {
  id: string;
  brand_name: string;
  title: string;
  deal_type: string;
  start_date: string;
  end_date: string;
  sale_price?: number;
  category?: string;
  // 추가 필드
  image_url?: string;
  normal_price?: number;
  barcode?: string;
  source_url?: string;
  raw_title?: string;
  saved_count?: number;
}

export interface SavedPromotion {
  promo_id: string;
  promo: {
    id: string;
    title: string;
    raw_title: string;
    deal_type: string;
    normal_price: number;
    sale_price: number;
    start_date: string;
    end_date: string;
    image_url: string;
    barcode: string | null;
    source_url: string;
    description: string | null;
    category: string | null;
    brand: {
      name: string;
    } | null;
  } | null;
}

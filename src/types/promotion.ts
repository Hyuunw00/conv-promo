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
}

export interface Promotion {
  id: string;
  brand_name: string;
  title: string;
  deal_type: string | null;
  start_date: string;
  end_date: string;
  sale_price: number | null;
  category: string | null;
}

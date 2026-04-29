import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  code: string;
  name: string;
  category_id: string;
  material: string;
  weight: string;
  size: string;
  description: string;
  listed_price: number;
  promotion_price: number | null;
  max_discount_percent: number;
  stock_quantity: number;
  stock_status: 'in_stock' | 'out_of_stock';
  is_visible_ipad: boolean;
  thumbnail_url: string;
  video_url: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  categories?: Category;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  is_thumbnail: boolean;
  sort_order: number;
  created_at: string;
};

export type Quotation = {
  id: string;
  quotation_code: string;
  product_id: string;
  listed_price: number;
  discount_percent: number;
  discount_amount: number;
  final_price: number;
  sale_user_id: string | null;
  sale_user_name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  note: string;
  created_at: string;
  updated_at: string;
  products?: Product;
};

export type SalesRecord = {
  id: string;
  product_id: string;
  quotation_id: string | null;
  listed_price: number;
  final_price: number;
  discount_percent: number;
  sale_user_id: string | null;
  sale_user_name: string;
  sold_at: string;
  note: string;
  created_at: string;
  products?: Product;
};

export type ActivityLog = {
  id: string;
  user_id: string | null;
  user_name: string;
  action: string;
  module: string;
  object_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string;
  created_at: string;
};

export type AppSetting = {
  id: string;
  key: string;
  value: string;
  description: string;
  updated_at: string;
};

export type InterestedProduct = {
  id: string;
  product_id: string;
  sale_user_id: string | null;
  sale_user_name: string;
  customer_name: string;
  customer_phone: string;
  note: string;
  created_at: string;
  products?: Product;
};

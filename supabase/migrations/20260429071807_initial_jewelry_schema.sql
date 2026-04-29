/*
  # Jewelry Store Demo - Initial Schema

  ## Tables
  - categories: Product categories (rings, necklaces, earrings, etc.)
  - products: Jewelry products with pricing, stock, discount rules
  - product_images: Multiple images per product
  - quotations: Price quotes created by sales staff
  - interested_products: Wishlist/interest list saved by sales
  - sales_records: Sold products record
  - activity_logs: Audit trail for important actions
  - app_settings: Configurable app settings

  ## Security
  - RLS enabled on all tables
  - Authenticated users have read access; role-based write access managed in app layer
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text DEFAULT '',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  category_id uuid REFERENCES categories(id),
  material text DEFAULT '',
  weight text DEFAULT '',
  size text DEFAULT '',
  description text DEFAULT '',
  listed_price numeric(18,0) DEFAULT 0,
  promotion_price numeric(18,0) DEFAULT NULL,
  max_discount_percent numeric(5,2) DEFAULT 10,
  stock_quantity int DEFAULT 0,
  stock_status text DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock')),
  is_visible_ipad boolean DEFAULT true,
  thumbnail_url text DEFAULT '',
  created_by uuid,
  updated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Product images
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  is_thumbnail boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read product_images"
  ON product_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert product_images"
  ON product_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update product_images"
  ON product_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete product_images"
  ON product_images FOR DELETE
  TO authenticated
  USING (true);

-- Quotations
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_code text UNIQUE NOT NULL,
  product_id uuid REFERENCES products(id),
  listed_price numeric(18,0) NOT NULL,
  discount_percent numeric(5,2) DEFAULT 0,
  discount_amount numeric(18,0) DEFAULT 0,
  final_price numeric(18,0) NOT NULL,
  sale_user_id uuid,
  sale_user_name text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  note text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert quotations"
  ON quotations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update quotations"
  ON quotations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Interested products (wishlist)
CREATE TABLE IF NOT EXISTS interested_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  sale_user_id uuid,
  sale_user_name text DEFAULT '',
  customer_name text DEFAULT '',
  customer_phone text DEFAULT '',
  note text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE interested_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read interested_products"
  ON interested_products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert interested_products"
  ON interested_products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete interested_products"
  ON interested_products FOR DELETE
  TO authenticated
  USING (true);

-- Sales records
CREATE TABLE IF NOT EXISTS sales_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  quotation_id uuid REFERENCES quotations(id),
  listed_price numeric(18,0) NOT NULL,
  final_price numeric(18,0) NOT NULL,
  discount_percent numeric(5,2) DEFAULT 0,
  sale_user_id uuid,
  sale_user_name text DEFAULT '',
  sold_at timestamptz DEFAULT now(),
  note text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sales_records"
  ON sales_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sales_records"
  ON sales_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_name text DEFAULT '',
  action text NOT NULL,
  module text NOT NULL,
  object_id text DEFAULT '',
  old_data jsonb DEFAULT NULL,
  new_data jsonb DEFAULT NULL,
  ip_address text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read activity_logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert activity_logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- App settings
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read app_settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert app_settings"
  ON app_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update app_settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_quotations_product ON quotations(product_id);
CREATE INDEX IF NOT EXISTS idx_quotations_sale_user ON quotations(sale_user_id);
CREATE INDEX IF NOT EXISTS idx_sales_records_product ON sales_records(product_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- Add video_url column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url text DEFAULT '';

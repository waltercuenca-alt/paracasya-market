-- ParacasYa Market Online - Order origin fields
-- Apply manually in Supabase SQL editor when ready.
--
-- Purpose:
-- - Track which hotel, Airbnb, reception desk, flyer, or partner QR generated an order.
--
-- Safety:
-- - This only adds nullable text columns to public.orders.
-- - It does not change RLS.
-- - It does not add anon write policies.
-- - It does not touch products, categories, order_items, or store_settings.

alter table public.orders
  add column if not exists order_origin text,
  add column if not exists order_origin_label text;

create index if not exists orders_order_origin_idx
  on public.orders(order_origin);

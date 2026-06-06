-- ParacasYa Market Online - Products and categories setup
-- Apply manually in Supabase SQL editor. Do NOT run with service_role in the frontend.
-- Security note:
-- - The current PIN is frontend-only MVP protection and is not real authorization.
-- - Do not allow INSERT/UPDATE/DELETE to anon.
-- - Admin writes must wait for Supabase Auth/admin role or a secure Edge Function.

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  category_id uuid references public.categories(id),
  category_slug text,
  image_url text,
  is_available boolean default true,
  is_featured boolean default false,
  stock_status text default 'available',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists products_category_slug_idx on public.products(category_slug);
create index if not exists products_is_available_idx on public.products(is_available);
create index if not exists products_is_featured_idx on public.products(is_featured);

alter table public.categories enable row level security;
alter table public.products enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and policyname = 'Public read active categories'
  ) then
    create policy "Public read active categories"
      on public.categories
      for select
      using (is_active = true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'Public read available products'
  ) then
    create policy "Public read available products"
      on public.products
      for select
      using (is_available = true);
  end if;
end $$;

insert into public.categories (name, slug, icon, is_active, sort_order)
values
  ('Bebidas', 'bebidas', 'BE', true, 10),
  ('Comida rápida', 'comida', 'CR', true, 20),
  ('Snacks', 'snacks', 'SN', true, 30),
  ('Promo del día', 'promo-dia', 'PD', true, 40)
on conflict (slug) do update set
  name = excluded.name,
  icon = excluded.icon,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();

with seed_products(name, description, price, category_slug, is_available, is_featured, stock_status) as (
  values
    ('Agua mineral personal', 'Botella personal fría para llevar.', 3.00, 'bebidas', true, true, 'available'),
    ('Agua mineral 1.5 L', 'Botella grande ideal para hotel o playa.', 6.00, 'bebidas', true, false, 'available'),
    ('Inca Kola personal', 'Botella personal bien fría.', 5.00, 'bebidas', true, false, 'available'),
    ('Coca-Cola personal', 'Botella personal helada.', 5.00, 'bebidas', true, false, 'available'),
    ('Gaseosa 1.5 L', 'Botella familiar para compartir.', 10.00, 'bebidas', true, false, 'available'),
    ('Sporade', 'Bebida rehidratante personal.', 5.00, 'bebidas', true, false, 'available'),
    ('Energizante', 'Lata energizante para seguir el día.', 8.00, 'bebidas', true, false, 'available'),
    ('Jugo personal', 'Jugo embotellado personal.', 4.50, 'bebidas', true, false, 'available'),
    ('Hielo pequeño', 'Bolsa pequeña de hielo purificado.', 5.00, 'bebidas', true, false, 'available'),
    ('Hielo grande', 'Bolsa grande para bebidas y conservación.', 9.00, 'bebidas', true, false, 'available'),
    ('Hamburguesa simple', 'Hamburguesa clásica con carne y queso.', 14.00, 'comida', true, true, 'available'),
    ('Hamburguesa con papas', 'Hamburguesa clásica con papas personales.', 19.00, 'comida', true, false, 'available'),
    ('Salchipapa', 'Papas doradas con hot dog y cremas.', 13.00, 'comida', true, false, 'available'),
    ('Sandwich de pollo', 'Pollo deshilachado con verduras y cremas.', 12.00, 'comida', true, false, 'available'),
    ('Pizza personal', 'Pizza individual caliente.', 15.00, 'comida', true, false, 'available'),
    ('Pan con pollo', 'Pan suave con pollo y mayonesa.', 9.00, 'comida', true, false, 'available'),
    ('Desayuno simple', 'Pan, bebida caliente y complemento del día.', 11.00, 'comida', true, false, 'available'),
    ('Papas personales', 'Bolsa personal de papas crocantes.', 4.50, 'snacks', true, false, 'available'),
    ('Doritos', 'Snack de maíz sabor queso.', 5.00, 'snacks', true, false, 'available'),
    ('Galletas dulces', 'Paquete personal de galletas dulces.', 3.50, 'snacks', true, false, 'available'),
    ('Galletas saladas', 'Paquete personal para picar.', 3.50, 'snacks', true, false, 'available'),
    ('Chocolate', 'Barra de chocolate personal.', 4.00, 'snacks', true, false, 'available'),
    ('Maní', 'Bolsa personal de maní salado.', 4.00, 'snacks', true, false, 'available'),
    ('Chicles', 'Paquete pequeño de chicles.', 2.50, 'snacks', true, false, 'available'),
    ('Caramelos', 'Mix pequeño de caramelos.', 2.00, 'snacks', true, false, 'available'),
    ('Agua + snack', 'Agua personal y snack personal.', 7.00, 'promo-dia', true, true, 'available'),
    ('Gaseosa + papas', 'Gaseosa personal con papas personales.', 9.00, 'promo-dia', true, false, 'available'),
    ('Salchipapa + gaseosa', 'Salchipapa personal con gaseosa helada.', 17.00, 'promo-dia', true, false, 'available'),
    ('Hamburguesa + bebida', 'Hamburguesa simple con bebida personal.', 18.00, 'promo-dia', true, false, 'available'),
    ('Combo hotel', 'Agua grande, hielo y snacks para la habitación.', 22.00, 'promo-dia', true, false, 'available')
)
insert into public.products (
  name,
  description,
  price,
  category_id,
  category_slug,
  is_available,
  is_featured,
  stock_status
)
select
  seed_products.name,
  seed_products.description,
  seed_products.price,
  categories.id,
  seed_products.category_slug,
  seed_products.is_available,
  seed_products.is_featured,
  seed_products.stock_status
from seed_products
join public.categories on categories.slug = seed_products.category_slug
where not exists (
  select 1 from public.products where products.name = seed_products.name
);

-- RLS is enabled above.
-- This file intentionally creates SELECT policies only.
-- No anon INSERT/UPDATE/DELETE policy is created.
--
-- What works after applying this SQL:
-- - /cliente can read active categories.
-- - /cliente can read available products.
-- - /admin can read the same public catalog.
--
-- What does NOT work yet:
-- - /admin cannot create/update/delete products from the browser with anon key.
-- - /admin cannot manage inactive/unavailable rows without authenticated admin policies.
--
-- Future secure admin options:
-- 1. Add Supabase Auth and an admin role/profile, then create write policies for authenticated admins only.
-- 2. Use a Supabase Edge Function with server-side authorization for catalog writes.

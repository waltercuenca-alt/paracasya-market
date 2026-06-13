-- ParacasYa Market Online - Travel essentials catalog add-on
-- Safe, idempotent catalog insert for products useful during a stay.
-- Commercial description:
-- Lo basico que puedes necesitar en tu hotel, Airbnb o casa, sin salir.
--
-- This file only inserts into public.categories and public.products.
-- It does not change RLS, policies, orders, order_items, store_settings, or functions.

do $$
declare
  essentials_category_id uuid;
  essentials_category_slug text;
begin
  select id, slug
    into essentials_category_id, essentials_category_slug
  from public.categories
  where slug = 'esenciales-de-viaje'
     or lower(name) = 'esenciales de viaje'
  order by created_at
  limit 1;

  if essentials_category_id is null then
    insert into public.categories (name, slug, icon, is_active, sort_order)
    values ('Esenciales de viaje', 'esenciales-de-viaje', '🧳', true, 60)
    on conflict (slug) do nothing
    returning id, slug into essentials_category_id, essentials_category_slug;

    if essentials_category_id is null then
      select id, slug
        into essentials_category_id, essentials_category_slug
      from public.categories
      where slug = 'esenciales-de-viaje'
      limit 1;
    end if;
  end if;

  if essentials_category_id is null then
    raise exception 'No se pudo resolver la categoria Esenciales de viaje';
  end if;

  update public.categories
  set
    is_active = true,
    updated_at = now()
  where id = essentials_category_id
    and is_active is distinct from true;

  with essentials_products(name, description, price, is_featured) as (
    values
      (
        'Papel higiénico rollo',
        'Papel higiénico en rollo. Básico para hotel, Airbnb o casa.',
        4.50,
        true
      ),
      (
        'Cepillo dental básico',
        'Cepillo dental básico para viaje o estadía.',
        5.00,
        true
      ),
      (
        'Pasta dental pequeña',
        'Pasta dental pequeña, práctica para viaje, hotel o Airbnb.',
        5.50,
        true
      ),
      (
        'Jabón personal',
        'Jabón personal para uso diario durante tu estadía.',
        4.00,
        false
      ),
      (
        'Shampoo pequeño o sachet premium',
        'Shampoo pequeño o sachet premium para viaje.',
        5.00,
        false
      ),
      (
        'Toallas húmedas paquete pequeño',
        'Toallas húmedas en paquete pequeño, útiles para viaje o habitación.',
        6.50,
        true
      ),
      (
        'Desodorante pequeño',
        'Desodorante pequeño, práctico para viaje o emergencia.',
        9.00,
        false
      ),
      (
        'Preservativos pack x3',
        'Pack de preservativos x3. Producto de cuidado personal.',
        12.00,
        false
      )
  )
  insert into public.products (
    name,
    description,
    price,
    category_id,
    category_slug,
    image_url,
    is_available,
    is_featured,
    stock_status
  )
  select
    essentials_products.name,
    essentials_products.description,
    essentials_products.price,
    essentials_category_id,
    essentials_category_slug,
    null,
    true,
    essentials_products.is_featured,
    'available'
  from essentials_products
  where not exists (
    select 1
    from public.products
    where lower(products.name) = lower(essentials_products.name)
  );
end $$;

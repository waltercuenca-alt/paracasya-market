-- ParacasYa Market Online - Beer catalog add-on
-- Safe, idempotent catalog insert for alcoholic beverages.
-- This file only touches public.categories and public.products.
-- It does not change RLS, policies, orders, order_items, store_settings, or functions.

do $$
declare
  beer_category_id uuid;
  beer_category_slug text;
begin
  select id, slug
    into beer_category_id, beer_category_slug
  from public.categories
  where slug in ('bebidas-alcoholicas', 'alcohol')
     or lower(name) in ('bebidas alcohólicas', 'bebidas alcoholicas', 'alcohol')
  order by
    case
      when slug = 'alcohol' then 0
      when lower(name) = 'alcohol' then 1
      when slug = 'bebidas-alcoholicas' then 2
      else 3
    end,
    created_at
  limit 1;

  if beer_category_id is null then
    insert into public.categories (name, slug, icon, is_active, sort_order)
    values ('Bebidas alcohólicas', 'bebidas-alcoholicas', 'BA', true, 50)
    on conflict (slug) do update set
      name = excluded.name,
      icon = excluded.icon,
      is_active = true,
      sort_order = excluded.sort_order,
      updated_at = now()
    returning id, slug into beer_category_id, beer_category_slug;
  else
    update public.categories
    set is_active = true,
        updated_at = now()
    where id = beer_category_id;
  end if;

  with beer_products(name, description, price, is_featured) as (
    values
      (
        'Cerveza Pilsen lata 355 ml',
        'Cerveza Pilsen lata 355 ml. Venta solo para mayores de 18 años. Tomar bebidas alcohólicas en exceso es dañino.',
        7.00,
        false
      ),
      (
        'Cerveza Cusqueña lata/botella',
        'Cerveza Cusqueña lata o botella. Venta solo para mayores de 18 años. Tomar bebidas alcohólicas en exceso es dañino.',
        8.50,
        false
      ),
      (
        'Six pack Cusqueña',
        'Six pack de cerveza Cusqueña. Ideal para compartir. Venta solo para mayores de 18 años. Tomar bebidas alcohólicas en exceso es dañino.',
        42.00,
        true
      ),
      (
        'Six pack Pilsen lata 355 ml',
        'Six pack de cerveza Pilsen lata 355 ml. Ideal para grupos, hoteles y Airbnbs. Venta solo para mayores de 18 años. Tomar bebidas alcohólicas en exceso es dañino.',
        35.00,
        true
      ),
      (
        'Corona botella 355 ml',
        'Cerveza Corona botella 355 ml. Opción premium para turistas. Venta solo para mayores de 18 años. Tomar bebidas alcohólicas en exceso es dañino.',
        11.00,
        false
      ),
      (
        'Six pack Corona botella 355 ml',
        'Six pack de cerveza Corona botella 355 ml. Opción premium para compartir. Venta solo para mayores de 18 años. Tomar bebidas alcohólicas en exceso es dañino.',
        60.00,
        true
      ),
      (
        'Tres Cruces lata/botella',
        'Cerveza Tres Cruces lata o botella. Venta solo para mayores de 18 años. Tomar bebidas alcohólicas en exceso es dañino.',
        7.50,
        false
      ),
      (
        'Stella Artois botella/lata',
        'Cerveza Stella Artois botella o lata. Opción premium. Venta solo para mayores de 18 años. Tomar bebidas alcohólicas en exceso es dañino.',
        10.00,
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
    beer_products.name,
    beer_products.description,
    beer_products.price,
    beer_category_id,
    beer_category_slug,
    null,
    true,
    beer_products.is_featured,
    'available'
  from beer_products
  where not exists (
    select 1
    from public.products
    where lower(products.name) = lower(beer_products.name)
  );
end $$;

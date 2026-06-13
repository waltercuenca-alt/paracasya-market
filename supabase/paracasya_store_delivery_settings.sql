-- ParacasYa Market Online - Delivery settings for the existing store_settings table.
-- Safe to run more than once.
-- This migration does not change RLS policies or grant anon write access.

alter table public.store_settings
  add column if not exists delivery_active boolean not null default true;

alter table public.store_settings
  add column if not exists delivery_fee numeric(10, 2) not null default 5.00;

update public.store_settings
set
  delivery_active = coalesce(delivery_active, true),
  delivery_fee = coalesce(delivery_fee, 5.00)
where id = 'main';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'store_settings_delivery_fee_nonnegative'
      and conrelid = 'public.store_settings'::regclass
  ) then
    alter table public.store_settings
      add constraint store_settings_delivery_fee_nonnegative
      check (delivery_fee >= 0);
  end if;
end $$;

-- Existing public SELECT remains unchanged.
-- No anon INSERT/UPDATE/DELETE policy is created.

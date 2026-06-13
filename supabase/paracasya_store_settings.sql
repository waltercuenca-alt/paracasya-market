-- ParacasYa Market Online - Store settings setup
-- Apply manually in Supabase SQL editor when ready.
--
-- Security:
-- - Public SELECT is allowed so /cliente can know if the store is open.
-- - No anon INSERT/UPDATE/DELETE policies are created.
-- - Admin writes must go through the admin-catalog Edge Function with service_role server-side.

create table if not exists public.store_settings (
  id text primary key default 'main',
  store_open boolean not null default true,
  delivery_active boolean not null default true,
  delivery_fee numeric(10, 2) not null default 5.00
    constraint store_settings_delivery_fee_nonnegative check (delivery_fee >= 0),
  opening_hours text not null default 'Atendemos de 10:00 a.m. a 10:00 p.m.',
  closed_message text not null default 'Estamos cerrados por ahora. Volvemos a atender mañana desde las 10:00 a.m.',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.store_settings enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'store_settings'
      and policyname = 'Public read store settings'
  ) then
    create policy "Public read store settings"
      on public.store_settings
      for select
      using (true);
  end if;
end $$;

insert into public.store_settings (
  id,
  store_open,
  delivery_active,
  delivery_fee,
  opening_hours,
  closed_message
)
values (
  'main',
  true,
  true,
  5.00,
  'Atendemos de 10:00 a.m. a 10:00 p.m.',
  'Estamos cerrados por ahora. Volvemos a atender mañana desde las 10:00 a.m.'
)
on conflict (id) do nothing;

-- No anon INSERT/UPDATE/DELETE policy is created.

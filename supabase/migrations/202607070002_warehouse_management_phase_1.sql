create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text not null,
  phone text not null,
  email text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  country text not null default 'India',
  pincode text not null,
  gst_number text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists warehouse_id uuid references public.warehouses(id) on delete restrict;

create index if not exists warehouses_active_idx on public.warehouses(active);
create index if not exists orders_warehouse_id_idx on public.orders(warehouse_id);

drop trigger if exists warehouses_set_updated_at on public.warehouses;
create trigger warehouses_set_updated_at
before update on public.warehouses
for each row execute function public.set_updated_at();

alter table public.warehouses enable row level security;

create policy "admins manage warehouses"
on public.warehouses for all to authenticated
using (public.is_admin()) with check (public.is_admin());

grant select, insert, update, delete on public.warehouses to authenticated;
grant all privileges on public.warehouses to service_role;

create table if not exists public.order_shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  warehouse_id uuid not null references public.warehouses(id) on delete restrict,
  shiprocket_order_id text,
  shipment_id text,
  awb_number text,
  courier_name text,
  tracking_url text,
  shipment_status text not null default 'pending',
  estimated_delivery_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, warehouse_id)
);

create index if not exists order_shipments_order_id_idx
  on public.order_shipments(order_id);

alter table public.order_shipments enable row level security;

drop policy if exists "admins manage order shipments"
  on public.order_shipments;

create policy "admins manage order shipments"
on public.order_shipments for all to authenticated
using (public.is_admin()) with check (public.is_admin());

grant select, insert, update, delete
  on public.order_shipments to authenticated;
grant all privileges on public.order_shipments to service_role;

drop trigger if exists order_shipments_set_updated_at
  on public.order_shipments;
create trigger order_shipments_set_updated_at
before update on public.order_shipments
for each row execute function public.set_updated_at();

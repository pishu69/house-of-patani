alter table public.orders
  add column if not exists shipment_status text;

alter table public.orders
  add column if not exists courier_name text,
  add column if not exists awb_number text,
  add column if not exists shipment_id text,
  add column if not exists estimated_delivery_date date;

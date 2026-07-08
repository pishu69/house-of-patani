alter table public.warehouses
  add column if not exists pickup_pincode text;

alter table public.warehouses
  add column if not exists shiprocket_pickup_location text;

alter table public.warehouses
  add column if not exists is_active boolean default true;

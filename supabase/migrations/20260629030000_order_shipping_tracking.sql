alter table public.orders
add column if not exists courier_partner text,
add column if not exists tracking_number text,
add column if not exists tracking_url text,
add column if not exists dispatched_at timestamptz,
add column if not exists estimated_delivery_at timestamptz,
add column if not exists delivered_at timestamptz;
alter table public.products
  add column if not exists shipping_weight_kg numeric(10, 3) not null default 0.7 check (shipping_weight_kg > 0),
  add column if not exists package_length_cm numeric(10, 2) not null default 30 check (package_length_cm > 0),
  add column if not exists package_breadth_cm numeric(10, 2) not null default 25 check (package_breadth_cm > 0),
  add column if not exists package_height_cm numeric(10, 2) not null default 5 check (package_height_cm > 0);

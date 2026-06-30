create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,

  sku text not null unique,
  stock_quantity integer not null default 0,
  reserved_quantity integer not null default 0,
  low_stock_threshold integer not null default 5,

  allow_backorder boolean not null default false,
  track_inventory boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,

  movement_type text not null check (
    movement_type in (
      'purchase',
      'manual_adjustment',
      'order_reserved',
      'order_released',
      'order_fulfilled',
      'return',
      'damage',
      'correction'
    )
  ),

  quantity integer not null,
  previous_quantity integer not null,
  new_quantity integer not null,

  reason text,
  reference_type text,
  reference_id uuid,

  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_purchase_entries (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,

  supplier_name text,
  quantity integer not null check (quantity > 0),
  unit_cost numeric(12,2),
  total_cost numeric(12,2),
  purchase_date date not null default current_date,
  notes text,

  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists inventory_items_product_id_idx
on public.inventory_items(product_id);

create index if not exists inventory_items_sku_idx
on public.inventory_items(sku);

create index if not exists inventory_movements_inventory_item_id_idx
on public.inventory_movements(inventory_item_id);

create index if not exists inventory_movements_product_id_idx
on public.inventory_movements(product_id);

create index if not exists inventory_purchase_entries_product_id_idx
on public.inventory_purchase_entries(product_id);

alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.inventory_purchase_entries enable row level security;

drop policy if exists "Public can read inventory items" on public.inventory_items;
create policy "Public can read inventory items"
on public.inventory_items
for select
using (true);

drop policy if exists "Admins can manage inventory items" on public.inventory_items;
create policy "Admins can manage inventory items"
on public.inventory_items
for all
using (
  exists (
    select 1
    from public.admins
    where admins.user_id = auth.uid()
    and admins.active = true
  )
)
with check (
  exists (
    select 1
    from public.admins
    where admins.user_id = auth.uid()
    and admins.active = true
  )
);

drop policy if exists "Admins can read inventory movements" on public.inventory_movements;
create policy "Admins can read inventory movements"
on public.inventory_movements
for select
using (
  exists (
    select 1
    from public.admins
    where admins.user_id = auth.uid()
    and admins.active = true
  )
);

drop policy if exists "Admins can insert inventory movements" on public.inventory_movements;
create policy "Admins can insert inventory movements"
on public.inventory_movements
for insert
with check (
  exists (
    select 1
    from public.admins
    where admins.user_id = auth.uid()
    and admins.active = true
  )
);

drop policy if exists "Admins can manage purchase entries" on public.inventory_purchase_entries;
create policy "Admins can manage purchase entries"
on public.inventory_purchase_entries
for all
using (
  exists (
    select 1
    from public.admins
    where admins.user_id = auth.uid()
    and admins.active = true
  )
)
with check (
  exists (
    select 1
    from public.admins
    where admins.user_id = auth.uid()
    and admins.active = true
  )
);
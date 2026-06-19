-- House of Patani initial commerce schema.
-- Apply through the Supabase CLI or SQL editor after reviewing environment-specific roles.

create extension if not exists pgcrypto;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  short_description text,
  price numeric(12, 2) not null default 0 check (price >= 0),
  original_price numeric(12, 2) not null default 0 check (original_price >= 0),
  category_id uuid references public.categories(id) on delete set null,
  stock integer not null default 0 check (stock >= 0),
  sku text not null unique,
  featured boolean not null default false,
  best_seller boolean not null default false,
  new_arrival boolean not null default false,
  active boolean not null default true,
  rating numeric(3, 2) not null default 0 check (rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (original_price >= price)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  email text not null unique,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  shipping numeric(12, 2) not null default 0 check (shipping >= 0),
  total numeric(12, 2) not null check (total >= 0),
  payment_method text not null default 'cod',
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  order_status text not null default 'pending'
    check (order_status in ('pending', 'processing', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  price numeric(12, 2) not null check (price >= 0),
  quantity integer not null check (quantity > 0),
  total numeric(12, 2) not null check (total >= 0)
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('fixed', 'percentage')),
  value numeric(12, 2) not null check (value >= 0),
  minimum_order_value numeric(12, 2) not null default 0
    check (minimum_order_value >= 0),
  usage_limit integer check (usage_limit is null or usage_limit >= 0),
  used_count integer not null default 0 check (used_count >= 0),
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  comment text,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, product_id)
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text not null,
  mobile_image_url text,
  link_url text,
  position text not null default 'home',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'admin'
    check (role in ('admin', 'super_admin')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_active_idx on public.categories(active);
create index products_category_id_idx on public.products(category_id);
create index products_active_idx on public.products(active);
create index products_featured_idx on public.products(featured) where featured;
create index products_best_seller_idx on public.products(best_seller) where best_seller;
create index products_new_arrival_idx on public.products(new_arrival) where new_arrival;
create index products_tags_idx on public.products using gin(tags);
create index product_images_product_id_idx on public.product_images(product_id, sort_order);
create index addresses_customer_id_idx on public.addresses(customer_id);
create index orders_customer_id_idx on public.orders(customer_id);
create index orders_created_at_idx on public.orders(created_at desc);
create index orders_status_idx on public.orders(order_status);
create index order_items_order_id_idx on public.order_items(order_id);
create index reviews_product_id_idx on public.reviews(product_id, approved);
create index wishlists_customer_id_idx on public.wishlists(customer_id);
create index banners_position_idx on public.banners(position, active, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create trigger addresses_set_updated_at
before update on public.addresses
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

create trigger settings_set_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

create trigger banners_set_updated_at
before update on public.banners
for each row execute function public.set_updated_at();

create trigger admins_set_updated_at
before update on public.admins
for each row execute function public.set_updated_at();

-- Security-definer helper for future admin authorization.
-- Keep app metadata or the admins table server-managed; never trust user metadata.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
      and active = true
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
      and role = 'super_admin'
      and active = true
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_super_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.is_super_admin() to authenticated, service_role;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.customers enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupons enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlists enable row level security;
alter table public.settings enable row level security;
alter table public.banners enable row level security;
alter table public.admins enable row level security;

create policy "public read active categories"
on public.categories for select
to anon, authenticated
using (active = true);

create policy "public read active products"
on public.products for select
to anon, authenticated
using (active = true);

create policy "public read images for active products"
on public.product_images for select
to anon, authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
      and products.active = true
  )
);

create policy "public read approved reviews"
on public.reviews for select
to anon, authenticated
using (approved = true);

create policy "public read active banners"
on public.banners for select
to anon, authenticated
using (active = true);

create policy "customers read own profile"
on public.customers for select
to authenticated
using (auth_user_id = auth.uid());

create policy "customers update own profile"
on public.customers for update
to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

create policy "customers manage own addresses"
on public.addresses for all
to authenticated
using (
  exists (
    select 1 from public.customers
    where customers.id = addresses.customer_id
      and customers.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.customers
    where customers.id = addresses.customer_id
      and customers.auth_user_id = auth.uid()
  )
);

create policy "customers read own orders"
on public.orders for select
to authenticated
using (
  exists (
    select 1 from public.customers
    where customers.id = orders.customer_id
      and customers.auth_user_id = auth.uid()
  )
);

create policy "customers read own order items"
on public.order_items for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    join public.customers on customers.id = orders.customer_id
    where orders.id = order_items.order_id
      and customers.auth_user_id = auth.uid()
  )
);

create policy "customers manage own wishlist"
on public.wishlists for all
to authenticated
using (
  exists (
    select 1 from public.customers
    where customers.id = wishlists.customer_id
      and customers.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.customers
    where customers.id = wishlists.customer_id
      and customers.auth_user_id = auth.uid()
  )
);

create policy "admins read own admin record"
on public.admins for select
to authenticated
using (user_id = auth.uid());

-- Admin write preparation. These policies remain inactive for ordinary users
-- until a matching active row is inserted into public.admins server-side.
create policy "admins manage categories"
on public.categories for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins manage products"
on public.products for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins manage product images"
on public.product_images for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins manage customers"
on public.customers for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins manage addresses"
on public.addresses for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins manage orders"
on public.orders for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins manage order items"
on public.order_items for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins manage coupons"
on public.coupons for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins manage reviews"
on public.reviews for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins manage settings"
on public.settings for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins manage banners"
on public.banners for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "super admins manage admins"
on public.admins for all to authenticated
using (public.is_super_admin()) with check (public.is_super_admin());

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.product_images,
  public.reviews, public.banners to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all privileges on all tables in schema public to service_role;

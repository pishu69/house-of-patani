alter table public.reviews
add column if not exists order_id uuid references public.orders(id) on delete set null,
add column if not exists verified_purchase boolean not null default false;

create index if not exists reviews_order_id_idx
on public.reviews(order_id);

create unique index if not exists reviews_one_per_order_product_customer_idx
on public.reviews(order_id, product_id, customer_id)
where order_id is not null and customer_id is not null;
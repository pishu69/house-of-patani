alter table public.orders
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text,
  add column if not exists razorpay_signature text,
  add column if not exists paid_at timestamptz;

create unique index if not exists orders_razorpay_order_id_idx
on public.orders(razorpay_order_id)
where razorpay_order_id is not null;

create table public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  items jsonb not null,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'INR' check (currency = 'INR'),
  status text not null default 'created'
    check (status in ('created', 'paid', 'failed', 'cancelled')),
  razorpay_order_id text unique,
  razorpay_payment_id text,
  razorpay_signature text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payment_intents_created_at_idx
on public.payment_intents(created_at desc);

create trigger payment_intents_set_updated_at
before update on public.payment_intents
for each row execute function public.set_updated_at();

alter table public.payment_intents enable row level security;

grant select, insert, update on public.payment_intents to service_role;

create or replace function public.finalize_razorpay_order(
  p_intent_id uuid,
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_razorpay_signature text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_intent public.payment_intents%rowtype;
  v_existing_order public.orders%rowtype;
  v_order public.orders%rowtype;
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_subtotal numeric(12, 2) := 0;
  v_shipping numeric(12, 2) := 0;
  v_threshold numeric(12, 2) := 5000;
  v_shipping_charge numeric(12, 2) := 250;
  v_settings jsonb;
  v_order_number text;
  v_paid_at timestamptz := now();
begin
  select * into v_intent
  from public.payment_intents
  where id = p_intent_id
  for update;

  if not found then
    raise exception 'PAYMENT_INTENT_NOT_FOUND';
  end if;

  if v_intent.razorpay_order_id is distinct from p_razorpay_order_id then
    raise exception 'RAZORPAY_ORDER_MISMATCH';
  end if;

  select * into v_existing_order
  from public.orders
  where razorpay_order_id = p_razorpay_order_id;

  if found then
    return jsonb_build_object(
      'order', to_jsonb(v_existing_order),
      'items', (
        select coalesce(jsonb_agg(to_jsonb(order_items)), '[]'::jsonb)
        from public.order_items
        where order_id = v_existing_order.id
      )
    );
  end if;

  if v_intent.status <> 'created' then
    raise exception 'PAYMENT_INTENT_NOT_OPEN';
  end if;

  select value into v_settings
  from public.settings
  where key = 'store';

  if v_settings is not null then
    v_threshold := coalesce(
      (v_settings ->> 'freeShippingThreshold')::numeric,
      v_threshold
    );
    v_shipping_charge := coalesce(
      (v_settings ->> 'shippingCharge')::numeric,
      v_shipping_charge
    );
  end if;

  for v_item in select * from jsonb_array_elements(v_intent.items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;

    select * into v_product
    from public.products
    where sku = v_item ->> 'sku'
      and active = true
    for update;

    if not found then
      raise exception 'PRODUCT_UNAVAILABLE';
    end if;

    if v_product.stock < v_quantity then
      raise exception 'INSUFFICIENT_STOCK';
    end if;

    v_subtotal := v_subtotal + (v_product.price * v_quantity);
  end loop;

  if v_subtotal < v_threshold then
    v_shipping := v_shipping_charge;
  end if;

  if v_intent.amount <> v_subtotal + v_shipping then
    raise exception 'PAYMENT_AMOUNT_MISMATCH';
  end if;

  v_order_number :=
    'HOP-' || to_char(current_date, 'YYMMDD') || '-' ||
    lpad(nextval('public.order_number_seq')::text, 5, '0');

  insert into public.orders (
    order_number,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    subtotal,
    discount,
    shipping,
    total,
    payment_method,
    payment_status,
    order_status,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    paid_at
  )
  values (
    v_order_number,
    v_intent.customer_name,
    v_intent.customer_email,
    v_intent.customer_phone,
    v_intent.shipping_address,
    v_subtotal,
    0,
    v_shipping,
    v_subtotal + v_shipping,
    'razorpay',
    'paid',
    'confirmed',
    p_razorpay_order_id,
    p_razorpay_payment_id,
    p_razorpay_signature,
    v_paid_at
  )
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(v_intent.items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;

    select * into v_product
    from public.products
    where sku = v_item ->> 'sku';

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      product_image,
      price,
      quantity,
      total
    )
    values (
      v_order.id,
      v_product.id,
      v_product.name,
      (
        select image_url
        from public.product_images
        where product_id = v_product.id
        order by is_primary desc, position asc
        limit 1
      ),
      v_product.price,
      v_quantity,
      v_product.price * v_quantity
    );

    update public.products
    set stock = stock - v_quantity
    where id = v_product.id;
  end loop;

  update public.payment_intents
  set
    status = 'paid',
    razorpay_payment_id = p_razorpay_payment_id,
    razorpay_signature = p_razorpay_signature,
    paid_at = v_paid_at
  where id = v_intent.id;

  return jsonb_build_object(
    'order', to_jsonb(v_order),
    'items', (
      select coalesce(jsonb_agg(to_jsonb(order_items)), '[]'::jsonb)
      from public.order_items
      where order_id = v_order.id
    )
  );
end;
$$;

revoke all on function public.finalize_razorpay_order(
  uuid,
  text,
  text,
  text
) from public;

grant execute on function public.finalize_razorpay_order(
  uuid,
  text,
  text,
  text
) to service_role;

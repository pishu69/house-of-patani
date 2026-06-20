create sequence if not exists public.order_number_seq start 1001;

create or replace function public.create_guest_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_address jsonb,
  p_payment_method text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_subtotal numeric(12, 2) := 0;
  v_shipping numeric(12, 2) := 0;
  v_threshold numeric(12, 2) := 5000;
  v_shipping_charge numeric(12, 2) := 250;
  v_settings jsonb;
  v_order public.orders%rowtype;
  v_order_number text;
begin
  if trim(p_customer_name) = ''
    or trim(p_customer_email) = ''
    or trim(p_customer_phone) = ''
    or p_items is null
    or jsonb_array_length(p_items) = 0
  then
    raise exception 'INVALID_ORDER';
  end if;

  if p_payment_method <> 'cod' then
    raise exception 'PAYMENT_METHOD_UNAVAILABLE';
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

    if coalesce((v_settings ->> 'codEnabled')::boolean, true) = false then
      raise exception 'COD_UNAVAILABLE';
    end if;
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;

    if v_quantity < 1 then
      raise exception 'INVALID_QUANTITY';
    end if;

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
    order_status
  )
  values (
    v_order_number,
    trim(p_customer_name),
    lower(trim(p_customer_email)),
    trim(p_customer_phone),
    p_address,
    v_subtotal,
    0,
    v_shipping,
    v_subtotal + v_shipping,
    'cod',
    'pending',
    'pending'
  )
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
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

revoke all on function public.create_guest_order(
  text,
  text,
  text,
  jsonb,
  text,
  jsonb
) from public;

grant execute on function public.create_guest_order(
  text,
  text,
  text,
  jsonb,
  text,
  jsonb
) to anon, authenticated, service_role;

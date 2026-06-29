create or replace function public.submit_verified_review(
  p_order_id uuid,
  p_product_id uuid,
  p_rating integer,
  p_title text,
  p_comment text
)
returns public.reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_email text;
  v_customer public.customers%rowtype;
  v_order public.orders%rowtype;
  v_review public.reviews%rowtype;
begin
  if auth.uid() is null then
    raise exception 'LOGIN_REQUIRED';
  end if;

  v_user_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  if p_rating < 1 or p_rating > 5 then
    raise exception 'INVALID_RATING';
  end if;

  select *
  into v_customer
  from public.customers
  where auth_user_id = auth.uid()
     or lower(email) = v_user_email
  limit 1;

  select *
  into v_order
  from public.orders
  where id = p_order_id
    and (
      customer_id = v_customer.id
      or lower(customer_email) = v_user_email
    )
  limit 1;

  if v_order.id is null then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  if v_order.order_status not in ('delivered') then
    raise exception 'ORDER_NOT_DELIVERED';
  end if;

  if not exists (
    select 1
    from public.order_items
    where order_id = p_order_id
      and product_id = p_product_id
  ) then
    raise exception 'PRODUCT_NOT_IN_ORDER';
  end if;

  if exists (
    select 1
    from public.reviews
    where order_id = p_order_id
      and product_id = p_product_id
      and (
        customer_id = v_customer.id
        or customer_name = coalesce(v_customer.name, v_order.customer_name)
      )
  ) then
    raise exception 'REVIEW_ALREADY_SUBMITTED';
  end if;

  insert into public.reviews (
    approved,
    comment,
    customer_id,
    customer_name,
    order_id,
    product_id,
    rating,
    title,
    verified_purchase
  )
  values (
    false,
    nullif(trim(p_comment), ''),
    v_customer.id,
    coalesce(nullif(v_customer.name, ''), v_order.customer_name),
    p_order_id,
    p_product_id,
    p_rating,
    nullif(trim(p_title), ''),
    true
  )
  returning * into v_review;

  return v_review;
end;
$$;

grant execute on function public.submit_verified_review(
  uuid,
  uuid,
  integer,
  text,
  text
) to authenticated;
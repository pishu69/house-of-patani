create or replace function public.lookup_guest_order(
  p_order_number text,
  p_contact text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
set row_security = off
as $$
declare
  v_order public.orders%rowtype;
  v_order_number text := upper(trim(p_order_number));
  v_contact text := lower(trim(p_contact));
  v_phone text := right(regexp_replace(p_contact, '[^0-9]', '', 'g'), 10);
begin
  if
    length(v_order_number) < 5
    or length(v_order_number) > 40
    or length(v_contact) < 5
    or length(v_contact) > 254
  then
    return null;
  end if;

  select * into v_order
  from public.orders
  where upper(order_number) = v_order_number
    and (
      lower(customer_email) = v_contact
      or (
        length(v_phone) = 10
        and right(
          regexp_replace(customer_phone, '[^0-9]', '', 'g'),
          10
        ) = v_phone
      )
    )
  limit 1;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'order',
    to_jsonb(v_order) || jsonb_build_object('razorpay_signature', null),
    'items',
    (
      select coalesce(jsonb_agg(to_jsonb(order_items)), '[]'::jsonb)
      from public.order_items
      where order_id = v_order.id
    )
  );
end;
$$;

revoke all on function public.lookup_guest_order(text, text) from public;
grant execute on function public.lookup_guest_order(text, text)
to anon, authenticated, service_role;

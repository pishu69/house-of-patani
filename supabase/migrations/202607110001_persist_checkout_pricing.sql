-- Preserve the verified checkout discount in COD orders without changing the
-- existing product, shipping, inventory, or order-number logic.
create or replace function public.create_guest_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_address jsonb,
  p_payment_method text,
  p_items jsonb,
  p_discount numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_confirmation jsonb;
  v_order public.orders%rowtype;
  v_discount numeric(12, 2);
begin
  v_confirmation := public.create_guest_order(
    p_customer_name, p_customer_email, p_customer_phone, p_address,
    p_payment_method, p_items
  );

  select * into v_order
  from public.orders
  where id = ((v_confirmation -> 'order' ->> 'id')::uuid)
  for update;

  v_discount := least(v_order.subtotal, greatest(0, round(coalesce(p_discount, 0), 2)));

  update public.orders
  set discount = v_discount,
      total = subtotal - v_discount + shipping
  where id = v_order.id
  returning * into v_order;

  return jsonb_build_object(
    'order', to_jsonb(v_order),
    'items', v_confirmation -> 'items'
  );
end;
$$;

revoke all on function public.create_guest_order(text, text, text, jsonb, text, jsonb, numeric) from public;
grant execute on function public.create_guest_order(text, text, text, jsonb, text, jsonb, numeric) to anon, authenticated, service_role;

-- Store the already server-verified Razorpay pricing breakdown with the intent.
alter table public.payment_intents
  add column if not exists subtotal numeric(12, 2),
  add column if not exists discount numeric(12, 2),
  add column if not exists shipping numeric(12, 2);

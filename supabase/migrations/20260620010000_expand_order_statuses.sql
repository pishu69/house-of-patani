alter table public.orders
  drop constraint if exists orders_order_status_check;

update public.orders
set order_status = case
  when order_status = 'processing' then 'confirmed'
  when order_status = 'completed' then 'delivered'
  else order_status
end;

alter table public.orders
  add constraint orders_order_status_check
  check (
    order_status in (
      'pending',
      'confirmed',
      'packed',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    )
  );

create policy "customers create verified purchase reviews"
on public.reviews for insert
to authenticated
with check (
  approved = false
  and verified_purchase = true
  and customer_id in (
    select id
    from public.customers
    where auth_user_id = auth.uid()
  )
  and exists (
    select 1
    from public.orders
    join public.order_items
      on order_items.order_id = orders.id
    where orders.id = reviews.order_id
      and orders.customer_id = reviews.customer_id
      and order_items.product_id = reviews.product_id
      and orders.order_status in ('delivered', 'completed')
  )
);
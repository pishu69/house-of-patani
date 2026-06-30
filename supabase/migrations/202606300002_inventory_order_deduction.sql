create or replace function public.deduct_inventory_for_order(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
  inventory record;
  previous_qty integer;
  new_qty integer;
begin
  if exists (
    select 1
    from public.inventory_movements
    where reference_type = 'order'
      and reference_id = p_order_id
      and movement_type = 'order_fulfilled'
  ) then
    return true;
  end if;

  for item in
    select product_id, quantity
    from public.order_items
    where order_id = p_order_id
      and product_id is not null
  loop
    select *
    into inventory
    from public.inventory_items
    where product_id = item.product_id
    limit 1;

    if inventory.id is null then
      continue;
    end if;

    if inventory.track_inventory = false then
      continue;
    end if;

    previous_qty := inventory.stock_quantity;
    new_qty := previous_qty - item.quantity;

    if new_qty < 0 and inventory.allow_backorder = false then
      raise exception 'Insufficient inventory for product %', item.product_id;
    end if;

    update public.inventory_items
    set
      stock_quantity = new_qty,
      updated_at = now()
    where id = inventory.id;

    update public.products
    set
      stock = greatest(new_qty, 0),
      updated_at = now()
    where id = item.product_id;

    insert into public.inventory_movements (
      inventory_item_id,
      product_id,
      movement_type,
      quantity,
      previous_quantity,
      new_quantity,
      reason,
      reference_type,
      reference_id
    )
    values (
      inventory.id,
      item.product_id,
      'order_fulfilled',
      -item.quantity,
      previous_qty,
      new_qty,
      'Stock deducted after confirmed order',
      'order',
      p_order_id
    );
  end loop;

  return true;
end;
$$;

grant execute on function public.deduct_inventory_for_order(uuid) to anon;
grant execute on function public.deduct_inventory_for_order(uuid) to authenticated;
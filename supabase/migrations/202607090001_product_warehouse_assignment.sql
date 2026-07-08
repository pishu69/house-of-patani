alter table public.products
  add column if not exists warehouse_id uuid
  references public.warehouses(id) on delete restrict;

create index if not exists products_warehouse_id_idx
  on public.products(warehouse_id);

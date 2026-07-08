alter table public.warehouses enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.warehouses to authenticated;
grant all privileges on table public.warehouses to service_role;

drop policy if exists "admins manage warehouses" on public.warehouses;
drop policy if exists "admins select warehouses" on public.warehouses;
drop policy if exists "admins insert warehouses" on public.warehouses;
drop policy if exists "admins update warehouses" on public.warehouses;
drop policy if exists "admins delete warehouses" on public.warehouses;

create policy "admins select warehouses"
on public.warehouses
for select
to authenticated
using (public.is_admin());

create policy "admins insert warehouses"
on public.warehouses
for insert
to authenticated
with check (public.is_admin());

create policy "admins update warehouses"
on public.warehouses
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins delete warehouses"
on public.warehouses
for delete
to authenticated
using (public.is_admin());

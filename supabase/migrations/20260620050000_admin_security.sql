-- Phase 10B: reinforce application guards with database authorization.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
set row_security = off
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
      and active = true
      and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
set row_security = off
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
      and role = 'super_admin'
      and active = true
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_super_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.is_super_admin() to authenticated, service_role;

drop policy if exists "public read store settings" on public.settings;
create policy "public read store settings"
on public.settings for select
to anon, authenticated
using (key = 'store');

grant select on public.settings to anon, authenticated;

drop policy if exists "admins read own admin record" on public.admins;
create policy "admins read own admin record"
on public.admins for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "admins upload commerce media" on storage.objects;
create policy "admins upload commerce media"
on storage.objects for insert
to authenticated
with check (
  bucket_id in (
    'product-images',
    'category-images',
    'banner-images',
    'store-assets'
  )
  and public.is_admin()
);

drop policy if exists "admins update commerce media" on storage.objects;
create policy "admins update commerce media"
on storage.objects for update
to authenticated
using (
  bucket_id in (
    'product-images',
    'category-images',
    'banner-images',
    'store-assets'
  )
  and public.is_admin()
)
with check (
  bucket_id in (
    'product-images',
    'category-images',
    'banner-images',
    'store-assets'
  )
  and public.is_admin()
);

drop policy if exists "admins delete commerce media" on storage.objects;
create policy "admins delete commerce media"
on storage.objects for delete
to authenticated
using (
  bucket_id in (
    'product-images',
    'category-images',
    'banner-images',
    'store-assets'
  )
  and public.is_admin()
);

-- Payment intents are server-owned. Guest clients only receive the public
-- intent identifier returned by the create-order Edge Function.
revoke all on public.payment_intents from anon, authenticated;
grant select, insert, update, delete on public.payment_intents to service_role;

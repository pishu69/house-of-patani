alter table public.product_images
  rename column sort_order to position;

alter table public.product_images
  add column if not exists is_primary boolean not null default false,
  add column if not exists storage_path text;

alter table public.categories
  add column if not exists image_path text;

alter table public.banners
  add column if not exists image_path text,
  add column if not exists mobile_image_path text;

create unique index product_images_one_primary_idx
on public.product_images(product_id)
where is_primary;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'product-images',
    'product-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'category-images',
    'category-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'banner-images',
    'banner-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'store-assets',
    'store-assets',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public read commerce media"
on storage.objects for select
to anon, authenticated
using (
  bucket_id in (
    'product-images',
    'category-images',
    'banner-images',
    'store-assets'
  )
);

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

create policy "admins update commerce media"
on storage.objects for update
to authenticated
using (public.is_admin())
with check (
  bucket_id in (
    'product-images',
    'category-images',
    'banner-images',
    'store-assets'
  )
  and public.is_admin()
);

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

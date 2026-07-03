alter table public.products
add column if not exists attributes jsonb;

update public.products
set attributes = '[]'::jsonb
where attributes is null;

alter table public.products
alter column attributes set default '[]'::jsonb,
alter column attributes set not null;

create or replace function public.recalculate_product_review_summary(
  p_product_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
  set
    rating = coalesce((
      select round(avg(rating)::numeric, 2)
      from public.reviews
      where product_id = p_product_id
        and approved = true
    ), 0),
    review_count = (
      select count(*)
      from public.reviews
      where product_id = p_product_id
        and approved = true
    ),
    updated_at = now()
  where id = p_product_id;
end;
$$;

create or replace function public.sync_product_review_summary()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_product_review_summary(old.product_id);
    return old;
  end if;

  perform public.recalculate_product_review_summary(new.product_id);

  if tg_op = 'UPDATE' and old.product_id is distinct from new.product_id then
    perform public.recalculate_product_review_summary(old.product_id);
  end if;

  return new;
end;
$$;

drop trigger if exists sync_product_review_summary_on_reviews on public.reviews;

create trigger sync_product_review_summary_on_reviews
after insert or update or delete on public.reviews
for each row
execute function public.sync_product_review_summary();

update public.products
set
  rating = coalesce(review_summary.rating, 0),
  review_count = coalesce(review_summary.review_count, 0),
  updated_at = now()
from (
  select
    p.id as product_id,
    round(avg(r.rating)::numeric, 2) filter (where r.approved = true) as rating,
    count(r.id) filter (where r.approved = true) as review_count
  from public.products p
  left join public.reviews r on r.product_id = p.id
  group by p.id
) as review_summary
where public.products.id = review_summary.product_id;

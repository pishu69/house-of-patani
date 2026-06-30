create or replace function public.validate_coupon(p_code text)
returns public.coupons
language sql
security definer
set search_path = public
as $$
  select *
  from public.coupons
  where upper(trim(code)) = upper(trim(p_code))
  limit 1;
$$;

grant execute on function public.validate_coupon(text) to anon;
grant execute on function public.validate_coupon(text) to authenticated;
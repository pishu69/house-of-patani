create or replace function public.update_verified_review(
  p_review_id uuid,
  p_rating integer,
  p_title text,
  p_comment text
)
returns public.reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_email text;
  v_customer public.customers%rowtype;
  v_review public.reviews%rowtype;
begin
  if auth.uid() is null then
    raise exception 'LOGIN_REQUIRED';
  end if;

  if p_rating < 1 or p_rating > 5 then
    raise exception 'INVALID_RATING';
  end if;

  v_user_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  select *
  into v_customer
  from public.customers
  where auth_user_id = auth.uid()
     or lower(email) = v_user_email
  limit 1;

  if v_customer.id is null then
    raise exception 'CUSTOMER_NOT_FOUND';
  end if;

  update public.reviews
  set
    rating = p_rating,
    title = nullif(trim(p_title), ''),
    comment = nullif(trim(p_comment), ''),
    approved = false,
    updated_at = now()
  where id = p_review_id
    and customer_id = v_customer.id
  returning * into v_review;

  if v_review.id is null then
    raise exception 'REVIEW_NOT_FOUND';
  end if;

  return v_review;
end;
$$;

grant execute on function public.update_verified_review(
  uuid,
  integer,
  text,
  text
) to authenticated;


create or replace function public.delete_verified_review(
  p_review_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_email text;
  v_customer public.customers%rowtype;
  v_deleted_count integer;
begin
  if auth.uid() is null then
    raise exception 'LOGIN_REQUIRED';
  end if;

  v_user_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  select *
  into v_customer
  from public.customers
  where auth_user_id = auth.uid()
     or lower(email) = v_user_email
  limit 1;

  if v_customer.id is null then
    raise exception 'CUSTOMER_NOT_FOUND';
  end if;

  delete from public.reviews
  where id = p_review_id
    and customer_id = v_customer.id;

  get diagnostics v_deleted_count = row_count;

  if v_deleted_count = 0 then
    raise exception 'REVIEW_NOT_FOUND';
  end if;

  return true;
end;
$$;

grant execute on function public.delete_verified_review(uuid) to authenticated;
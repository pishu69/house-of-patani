create or replace function public.upsert_customer_from_auth()
returns public.customers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user auth.users%rowtype;
  v_customer public.customers%rowtype;
  v_email text;
  v_name text;
begin
  select *
  into v_user
  from auth.users
  where id = auth.uid();

  if v_user.id is null then
    raise exception 'Not authenticated';
  end if;

  v_email := lower(coalesce(v_user.email, 'customer-' || v_user.id::text || '@auth.houseofpatani.invalid'));
  v_name := coalesce(
    v_user.raw_user_meta_data->>'full_name',
    v_user.raw_user_meta_data->>'name',
    'House of Patani Customer'
  );

  insert into public.customers (
    auth_user_id,
    name,
    email,
    phone,
    active
  )
  values (
    v_user.id,
    v_name,
    v_email,
    null,
    true
  )
  on conflict (auth_user_id)
  do update set
    name = excluded.name,
    email = excluded.email,
    updated_at = now()
  returning *
  into v_customer;

  return v_customer;
end;
$$;

revoke all on function public.upsert_customer_from_auth() from public;
grant execute on function public.upsert_customer_from_auth() to authenticated;
grant execute on function public.upsert_customer_from_auth() to service_role;

create table public.customer_otp_requests (
  phone_hash text primary key,
  send_count integer not null default 0 check (send_count >= 0),
  verify_count integer not null default 0 check (verify_count >= 0),
  window_started_at timestamptz not null default now(),
  last_sent_at timestamptz,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

create trigger customer_otp_requests_set_updated_at
before update on public.customer_otp_requests
for each row execute function public.set_updated_at();

alter table public.customer_otp_requests enable row level security;
revoke all on public.customer_otp_requests from anon, authenticated;
grant select, insert, update, delete on public.customer_otp_requests
to service_role;

create or replace function public.complete_customer_otp_login(
  p_auth_user_id uuid,
  p_phone text,
  p_name text,
  p_email text,
  p_addresses jsonb,
  p_wishlist_product_ids text[]
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
set row_security = off
as $$
declare
  v_customer public.customers%rowtype;
  v_phone_digits text :=
    right(regexp_replace(p_phone, '[^0-9]', '', 'g'), 10);
  v_name text := nullif(trim(p_name), '');
  v_email text := nullif(lower(trim(p_email)), '');
  v_address jsonb;
  v_product_id text;
begin
  if
    p_auth_user_id is null
    or length(v_phone_digits) <> 10
    or left(v_phone_digits, 1) not in ('6', '7', '8', '9')
  then
    raise exception 'INVALID_CUSTOMER_LOGIN';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_phone_digits));

  select * into v_customer
  from public.customers
  where auth_user_id = p_auth_user_id
    or right(regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g'), 10)
      = v_phone_digits
  order by (auth_user_id = p_auth_user_id) desc, created_at asc
  limit 1
  for update;

  if found then
    update public.customers
    set
      active = true,
      auth_user_id = p_auth_user_id,
      name = coalesce(v_name, name),
      email = case
        when v_email is not null
          and not exists (
            select 1
            from public.customers email_owner
            where email_owner.email = v_email
              and email_owner.id <> v_customer.id
          )
        then v_email
        else email
      end,
      phone = '+91' || v_phone_digits
    where id = v_customer.id
    returning * into v_customer;
  else
    insert into public.customers (
      active,
      auth_user_id,
      email,
      name,
      phone
    )
    values (
      true,
      p_auth_user_id,
      case
        when v_email is not null
          and not exists (
            select 1
            from public.customers
            where email = v_email
          )
        then v_email
        else 'phone-' || v_phone_digits || '@auth.houseofpatani.invalid'
      end,
      coalesce(v_name, 'House of Patani Customer'),
      '+91' || v_phone_digits
    )
    returning * into v_customer;
  end if;

  update public.orders
  set customer_id = v_customer.id
  where customer_id is null
    and right(
      regexp_replace(customer_phone, '[^0-9]', '', 'g'),
      10
    ) = v_phone_digits;

  if jsonb_typeof(p_addresses) = 'array' then
    for v_address in
      select * from jsonb_array_elements(p_addresses)
    loop
      if
        length(trim(coalesce(v_address ->> 'line1', ''))) >= 5
        and (v_address ->> 'postalCode') ~ '^[1-9][0-9]{5}$'
        and not exists (
          select 1
          from public.addresses
          where customer_id = v_customer.id
            and lower(line1) =
              lower(trim(coalesce(v_address ->> 'line1', '')))
            and postal_code = v_address ->> 'postalCode'
        )
      then
        if coalesce((v_address ->> 'isDefault')::boolean, false) then
          update public.addresses
          set is_default = false
          where customer_id = v_customer.id;
        end if;

        insert into public.addresses (
          city,
          country,
          customer_id,
          is_default,
          label,
          line1,
          line2,
          postal_code,
          state
        )
        values (
          trim(coalesce(v_address ->> 'city', '')),
          trim(coalesce(v_address ->> 'country', 'India')),
          v_customer.id,
          coalesce((v_address ->> 'isDefault')::boolean, false),
          nullif(trim(v_address ->> 'label'), ''),
          trim(v_address ->> 'line1'),
          nullif(trim(v_address ->> 'line2'), ''),
          v_address ->> 'postalCode',
          trim(coalesce(v_address ->> 'state', ''))
        );
      end if;
    end loop;
  end if;

  foreach v_product_id in array coalesce(
    p_wishlist_product_ids,
    array[]::text[]
  )
  loop
    insert into public.wishlists (customer_id, product_id)
    select v_customer.id, products.id
    from public.products
    where products.id::text = v_product_id
    on conflict (customer_id, product_id) do nothing;
  end loop;

  return jsonb_build_object(
    'customer',
    to_jsonb(v_customer),
    'addresses',
    (
      select coalesce(jsonb_agg(to_jsonb(addresses)), '[]'::jsonb)
      from public.addresses
      where customer_id = v_customer.id
    ),
    'wishlistProductIds',
    (
      select coalesce(
        jsonb_agg(wishlists.product_id::text),
        '[]'::jsonb
      )
      from public.wishlists
      where customer_id = v_customer.id
    )
  );
end;
$$;

revoke all on function public.complete_customer_otp_login(
  uuid,
  text,
  text,
  text,
  jsonb,
  text[]
) from public;

grant execute on function public.complete_customer_otp_login(
  uuid,
  text,
  text,
  text,
  jsonb,
  text[]
) to service_role;

create or replace function public.sync_customer_account(
  p_name text,
  p_email text,
  p_addresses jsonb,
  p_wishlist_product_ids text[]
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
set row_security = off
as $$
declare
  v_customer public.customers%rowtype;
  v_address jsonb;
  v_product_id text;
begin
  select * into v_customer
  from public.customers
  where auth_user_id = auth.uid()
    and active = true
  limit 1
  for update;

  if not found then
    raise exception 'CUSTOMER_SESSION_REQUIRED';
  end if;

  update public.customers
  set
    name = coalesce(nullif(trim(p_name), ''), name),
    email = coalesce(nullif(lower(trim(p_email)), ''), email)
  where id = v_customer.id;

  delete from public.addresses
  where customer_id = v_customer.id;

  if jsonb_typeof(p_addresses) = 'array' then
    for v_address in
      select * from jsonb_array_elements(p_addresses)
    loop
      if
        length(trim(coalesce(v_address ->> 'line1', ''))) >= 5
        and (v_address ->> 'postalCode') ~ '^[1-9][0-9]{5}$'
      then
        insert into public.addresses (
          city,
          country,
          customer_id,
          is_default,
          label,
          line1,
          line2,
          postal_code,
          state
        )
        values (
          trim(coalesce(v_address ->> 'city', '')),
          trim(coalesce(v_address ->> 'country', 'India')),
          v_customer.id,
          coalesce((v_address ->> 'isDefault')::boolean, false),
          nullif(trim(v_address ->> 'label'), ''),
          trim(v_address ->> 'line1'),
          nullif(trim(v_address ->> 'line2'), ''),
          v_address ->> 'postalCode',
          trim(coalesce(v_address ->> 'state', ''))
        );
      end if;
    end loop;
  end if;

  delete from public.wishlists
  where customer_id = v_customer.id;

  foreach v_product_id in array coalesce(
    p_wishlist_product_ids,
    array[]::text[]
  )
  loop
    insert into public.wishlists (customer_id, product_id)
    select v_customer.id, products.id
    from public.products
    where products.id::text = v_product_id
    on conflict (customer_id, product_id) do nothing;
  end loop;
end;
$$;

revoke all on function public.sync_customer_account(
  text,
  text,
  jsonb,
  text[]
) from public;

grant execute on function public.sync_customer_account(
  text,
  text,
  jsonb,
  text[]
) to authenticated, service_role;

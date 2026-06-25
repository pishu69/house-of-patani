create table if not exists public.contact_messages (
    id uuid primary key default gen_random_uuid(),

    created_at timestamptz not null default now(),

    name text not null,

    email text not null,

    message text not null,

    is_read boolean not null default false
);

alter table public.contact_messages
enable row level security;

create policy "Anyone can insert contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

create policy "Admins can read contact messages"
on public.contact_messages
for select
to authenticated
using (true);
create type public.app_role as enum ('client', 'provider', 'admin');
create type public.locale as enum ('fr', 'ar');
create type public.profile_status as enum ('active', 'suspended', 'deleted');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text,
  display_name text,
  locale public.locale not null default 'fr',
  status public.profile_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_phone_length check (phone is null or char_length(phone) between 8 and 20),
  constraint profiles_display_name_length check (
    display_name is null or char_length(display_name) between 2 and 120
  )
);

create table public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

comment on table public.profiles is 'Application identity linked one-to-one to auth.users.';
comment on table public.user_roles is 'Roles assigned by trusted backend or administration only.';

create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_locale public.locale;
begin
  requested_locale := case
    when new.raw_user_meta_data ->> 'locale' in ('fr', 'ar')
      then (new.raw_user_meta_data ->> 'locale')::public.locale
    else 'fr'::public.locale
  end;

  insert into public.profiles (id, phone, display_name, locale)
  values (
    new.id,
    new.phone,
    nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 120), ''),
    requested_locale
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'client');

  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function app_private.set_updated_at();

create trigger auth_user_created
after insert on auth.users
for each row execute function app_private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "roles_select_own"
on public.user_roles
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.profiles from public, anon, authenticated;
revoke all on table public.user_roles from public, anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, locale) on table public.profiles to authenticated;
grant select on table public.user_roles to authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from anon, authenticated;
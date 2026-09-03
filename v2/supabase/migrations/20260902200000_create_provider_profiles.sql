create type public.provider_verification_status as enum ('pending', 'verified', 'rejected');
create type public.provider_vehicle_type as enum ('tow_truck', 'service_vehicle');

create table public.provider_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  business_name text not null,
  city text not null,
  vehicle_type public.provider_vehicle_type not null,
  vehicle_registration text not null,
  service_ids public.request_service[] not null,
  verification_status public.provider_verification_status not null default 'pending',
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  verified_at timestamptz,
  constraint provider_profiles_business_name_length
    check (char_length(business_name) between 2 and 120),
  constraint provider_profiles_city check (city in ('Casablanca', 'Rabat')),
  constraint provider_profiles_vehicle_registration_length
    check (char_length(vehicle_registration) between 3 and 20),
  constraint provider_profiles_services_not_empty
    check (cardinality(service_ids) between 1 and 4),
  constraint provider_profiles_verification_consistency check (
    (verification_status = 'verified' and verified_at is not null and rejection_reason is null)
    or (verification_status = 'rejected' and verified_at is null and rejection_reason is not null)
    or (verification_status = 'pending' and verified_at is null and rejection_reason is null)
  )
);

create trigger provider_profiles_set_updated_at
before update on public.provider_profiles
for each row execute function app_private.set_updated_at();

create or replace function app_private.sync_provider_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.verification_status = 'verified' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'provider')
    on conflict (user_id, role) do nothing;
  else
    delete from public.user_roles
    where user_id = new.id and role = 'provider';
  end if;
  return new;
end;
$$;

create trigger provider_profile_role_sync
after insert or update of verification_status on public.provider_profiles
for each row execute function app_private.sync_provider_role();

alter table public.provider_profiles enable row level security;

create policy "provider_profiles_select_own"
on public.provider_profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "provider_profiles_insert_own"
on public.provider_profiles
for insert
to authenticated
with check ((select auth.uid()) = id and verification_status = 'pending');

create policy "provider_profiles_update_own"
on public.provider_profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

revoke all on table public.provider_profiles from public, anon, authenticated;
grant select on table public.provider_profiles to authenticated;
grant insert (id, business_name, city, vehicle_type, vehicle_registration, service_ids)
on table public.provider_profiles to authenticated;
grant update (business_name, city, vehicle_type, vehicle_registration, service_ids)
on table public.provider_profiles to authenticated;
grant select, insert, update, delete on table public.provider_profiles to service_role;

create or replace function public.list_eligible_requests()
returns table (
  id uuid,
  service public.request_service,
  vehicle jsonb,
  city text,
  description text,
  urgency text,
  safety_status text,
  photo_count bigint,
  published_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    request_drafts.id,
    request_drafts.service,
    jsonb_build_object(
      'make', request_drafts.vehicle ->> 'make',
      'model', request_drafts.vehicle ->> 'model'
    ) as vehicle,
    request_drafts.location ->> 'city' as city,
    request_drafts.details ->> 'description' as description,
    request_drafts.details ->> 'urgency' as urgency,
    request_drafts.details ->> 'safetyStatus' as safety_status,
    count(request_photos.id) as photo_count,
    request_drafts.published_at
  from public.request_drafts
  join public.provider_profiles
    on provider_profiles.id = (select auth.uid())
    and provider_profiles.verification_status = 'verified'
    and provider_profiles.city = request_drafts.location ->> 'city'
    and request_drafts.service = any(provider_profiles.service_ids)
  left join public.request_photos
    on request_photos.request_id = request_drafts.id
  where request_drafts.status = 'published'
  group by request_drafts.id
  order by request_drafts.published_at desc;
$$;

revoke all on function public.list_eligible_requests() from public, anon;
grant execute on function public.list_eligible_requests() to authenticated;

comment on function public.list_eligible_requests() is
  'Returns only approximate request data to verified providers matching city and service.';
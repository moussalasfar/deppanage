create type public.intervention_status as enum (
  'assigned',
  'en_route',
  'arrived',
  'completed',
  'cancelled'
);

create table public.interventions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.request_drafts (id),
  offer_id uuid not null unique references public.offers (id),
  client_id uuid not null references public.profiles (id),
  provider_id uuid not null references public.provider_profiles (id),
  amount_minor integer not null,
  eta_minutes integer not null,
  status public.intervention_status not null default 'assigned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interventions_amount_positive check (amount_minor > 0),
  constraint interventions_eta_positive check (eta_minutes > 0)
);

create index interventions_client_status_idx
on public.interventions (client_id, status);

create index interventions_provider_status_idx
on public.interventions (provider_id, status);

create trigger interventions_set_updated_at
before update on public.interventions
for each row execute function app_private.set_updated_at();

alter table public.interventions enable row level security;

create policy "interventions_select_participant"
on public.interventions
for select
to authenticated
using ((select auth.uid()) in (client_id, provider_id));

revoke all on table public.interventions from public, anon, authenticated;
grant select on table public.interventions to authenticated;
grant select, insert, update, delete on table public.interventions to service_role;

create or replace function public.list_client_request_offers(p_request_id uuid)
returns table (
  id uuid,
  request_id uuid,
  provider_id uuid,
  provider_name text,
  provider_vehicle_type public.provider_vehicle_type,
  amount_minor integer,
  eta_minutes integer,
  message text,
  status public.offer_status,
  expires_at timestamptz,
  intervention_id uuid
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    offers.id,
    offers.request_id,
    offers.provider_id,
    provider_profiles.business_name,
    provider_profiles.vehicle_type,
    offers.amount_minor,
    offers.eta_minutes,
    offers.message,
    offers.status,
    offers.expires_at,
    interventions.id
  from public.request_drafts
  join public.offers on offers.request_id = request_drafts.id
  join public.provider_profiles on provider_profiles.id = offers.provider_id
  left join public.interventions on interventions.offer_id = offers.id
  where request_drafts.id = p_request_id
    and request_drafts.user_id = (select auth.uid())
  order by offers.amount_minor, offers.eta_minutes, offers.created_at;
$$;

revoke all on function public.list_client_request_offers(uuid) from public, anon;
grant execute on function public.list_client_request_offers(uuid) to authenticated;

create or replace function public.accept_client_offer(p_offer_id uuid)
returns table (id uuid, request_id uuid, offer_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_offer public.offers;
  v_request public.request_drafts;
  v_intervention_id uuid;
begin
  select * into v_offer
  from public.offers
  where offers.id = p_offer_id;

  if not found then
    raise exception 'OFFER_NOT_AVAILABLE';
  end if;

  select * into v_request
  from public.request_drafts
  where request_drafts.id = v_offer.request_id
    and request_drafts.user_id = (select auth.uid())
    and request_drafts.status = 'published'
  for update;

  if not found then
    raise exception 'OFFER_NOT_AVAILABLE';
  end if;

  if exists (
    select 1 from public.interventions
    where interventions.request_id = v_request.id
  ) then
    raise exception 'OFFER_ALREADY_ACCEPTED';
  end if;

  if v_offer.status <> 'submitted' or v_offer.expires_at <= now() then
    raise exception 'OFFER_NOT_AVAILABLE';
  end if;

  update public.offers
  set status = case when offers.id = v_offer.id then 'accepted' else 'rejected' end
  where offers.request_id = v_request.id
    and offers.status = 'submitted';

  insert into public.interventions (
    request_id,
    offer_id,
    client_id,
    provider_id,
    amount_minor,
    eta_minutes
  ) values (
    v_request.id,
    v_offer.id,
    v_request.user_id,
    v_offer.provider_id,
    v_offer.amount_minor,
    v_offer.eta_minutes
  )
  returning interventions.id into v_intervention_id;

  return query select v_intervention_id, v_request.id, v_offer.id;
end;
$$;

revoke all on function public.accept_client_offer(uuid) from public, anon;
grant execute on function public.accept_client_offer(uuid) to authenticated;

create or replace function public.get_participant_intervention(
  p_intervention_id uuid
)
returns table (
  id uuid,
  request_id uuid,
  service public.request_service,
  vehicle jsonb,
  location jsonb,
  provider_name text,
  provider_vehicle_registration text,
  amount_minor integer,
  eta_minutes integer,
  status public.intervention_status,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    interventions.id,
    interventions.request_id,
    request_drafts.service,
    request_drafts.vehicle,
    request_drafts.location,
    provider_profiles.business_name,
    provider_profiles.vehicle_registration,
    interventions.amount_minor,
    interventions.eta_minutes,
    interventions.status,
    interventions.created_at
  from public.interventions
  join public.request_drafts on request_drafts.id = interventions.request_id
  join public.provider_profiles on provider_profiles.id = interventions.provider_id
  where interventions.id = p_intervention_id
    and (select auth.uid()) in (
      interventions.client_id,
      interventions.provider_id
    );
$$;

revoke all on function public.get_participant_intervention(uuid) from public, anon;
grant execute on function public.get_participant_intervention(uuid) to authenticated;

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
    ),
    request_drafts.location ->> 'city',
    request_drafts.details ->> 'description',
    request_drafts.details ->> 'urgency',
    request_drafts.details ->> 'safetyStatus',
    count(request_photos.id),
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
    and not exists (
      select 1 from public.interventions
      where interventions.request_id = request_drafts.id
    )
  group by request_drafts.id
  order by request_drafts.published_at desc;
$$;

comment on table public.interventions is
  'Accepted offers with price and ETA frozen at assignment time.';
comment on function public.accept_client_offer(uuid) is
  'Atomically accepts one offer owned by the client and creates its intervention.';
comment on function public.get_participant_intervention(uuid) is
  'Returns assigned intervention details, including exact location, only to its participants.';
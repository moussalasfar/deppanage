create type public.offer_status as enum ('submitted', 'accepted', 'rejected', 'withdrawn', 'expired');

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.request_drafts (id) on delete cascade,
  provider_id uuid not null references public.provider_profiles (id) on delete cascade,
  amount_minor integer not null,
  eta_minutes integer not null,
  message text not null default '',
  status public.offer_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '20 minutes'),
  constraint offers_amount_range check (amount_minor between 5000 and 500000),
  constraint offers_eta_range check (eta_minutes between 5 and 240),
  constraint offers_message_length check (char_length(message) <= 240),
  constraint offers_provider_request_unique unique (request_id, provider_id)
);

create index offers_request_status_idx on public.offers (request_id, status);
create index offers_provider_status_idx on public.offers (provider_id, status);

create trigger offers_set_updated_at
before update on public.offers
for each row execute function app_private.set_updated_at();

alter table public.offers enable row level security;

create policy "offers_select_provider_own"
on public.offers
for select
to authenticated
using ((select auth.uid()) = provider_id);

create policy "offers_select_client_own_request"
on public.offers
for select
to authenticated
using (
  exists (
    select 1
    from public.request_drafts
    where request_drafts.id = offers.request_id
      and request_drafts.user_id = (select auth.uid())
  )
);

revoke all on table public.offers from public, anon, authenticated;
grant select on table public.offers to authenticated;
grant select, insert, update, delete on table public.offers to service_role;

create or replace function public.submit_provider_offer(
  p_request_id uuid,
  p_amount_minor integer,
  p_eta_minutes integer,
  p_message text default ''
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_provider public.provider_profiles;
  v_request public.request_drafts;
  v_offer_id uuid;
begin
  if p_amount_minor is null
    or p_eta_minutes is null
    or p_amount_minor not between 5000 and 500000
    or p_eta_minutes not between 5 and 240
    or char_length(trim(coalesce(p_message, ''))) > 240 then
    raise exception 'INVALID_OFFER';
  end if;

  select * into v_provider
  from public.provider_profiles
  where id = (select auth.uid())
    and verification_status = 'verified';

  if not found then
    raise exception 'PROVIDER_NOT_VERIFIED';
  end if;

  select * into v_request
  from public.request_drafts
  where id = p_request_id
    and status = 'published'
    and location ->> 'city' = v_provider.city
    and service = any(v_provider.service_ids)
  for update;

  if not found then
    raise exception 'REQUEST_NOT_ELIGIBLE';
  end if;

  insert into public.offers (
    request_id,
    provider_id,
    amount_minor,
    eta_minutes,
    message,
    status,
    expires_at
  )
  values (
    p_request_id,
    v_provider.id,
    p_amount_minor,
    p_eta_minutes,
    trim(coalesce(p_message, '')),
    'submitted',
    now() + interval '20 minutes'
  )
  on conflict (request_id, provider_id) do update set
    amount_minor = excluded.amount_minor,
    eta_minutes = excluded.eta_minutes,
    message = excluded.message,
    status = 'submitted',
    expires_at = excluded.expires_at
  returning id into v_offer_id;

  return v_offer_id;
end;
$$;

revoke all on function public.submit_provider_offer(uuid, integer, integer, text)
from public, anon;
grant execute on function public.submit_provider_offer(uuid, integer, integer, text)
to authenticated;

comment on table public.offers is
  'Price and arrival-time proposals submitted by verified providers.';
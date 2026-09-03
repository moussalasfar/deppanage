create table public.intervention_events (
  id uuid primary key default gen_random_uuid(),
  intervention_id uuid not null references public.interventions (id) on delete cascade,
  actor_id uuid not null references public.profiles (id),
  previous_status public.intervention_status not null,
  next_status public.intervention_status not null,
  created_at timestamptz not null default now(),
  constraint intervention_events_status_changed
    check (previous_status <> next_status)
);

create index intervention_events_intervention_created_idx
on public.intervention_events (intervention_id, created_at);

alter table public.intervention_events enable row level security;

create policy "intervention_events_select_participant"
on public.intervention_events
for select
to authenticated
using (
  exists (
    select 1
    from public.interventions
    where interventions.id = intervention_events.intervention_id
      and (select auth.uid()) in (
        interventions.client_id,
        interventions.provider_id
      )
  )
);

revoke all on table public.intervention_events from public, anon, authenticated;
grant select on table public.intervention_events to authenticated;
grant select, insert on table public.intervention_events to service_role;

drop function public.get_participant_intervention(uuid);

create function public.get_participant_intervention(p_intervention_id uuid)
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
  participant_role text,
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
    case
      when interventions.provider_id = (select auth.uid()) then 'provider'
      else 'client'
    end,
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

create or replace function public.advance_provider_intervention(
  p_intervention_id uuid,
  p_next_status public.intervention_status
)
returns public.intervention_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_intervention public.interventions;
  v_expected_status public.intervention_status;
begin
  select * into v_intervention
  from public.interventions
  where interventions.id = p_intervention_id
    and interventions.provider_id = (select auth.uid())
  for update;

  if not found then
    raise exception 'INTERVENTION_NOT_AVAILABLE';
  end if;

  v_expected_status := case v_intervention.status
    when 'assigned' then 'en_route'::public.intervention_status
    when 'en_route' then 'arrived'::public.intervention_status
    when 'arrived' then 'completed'::public.intervention_status
    else null
  end;

  if v_expected_status is null or p_next_status <> v_expected_status then
    raise exception 'INVALID_INTERVENTION_TRANSITION';
  end if;

  update public.interventions
  set status = p_next_status
  where interventions.id = v_intervention.id;

  insert into public.intervention_events (
    intervention_id,
    actor_id,
    previous_status,
    next_status
  ) values (
    v_intervention.id,
    (select auth.uid()),
    v_intervention.status,
    p_next_status
  );

  return p_next_status;
end;
$$;

revoke all on function public.advance_provider_intervention(
  uuid,
  public.intervention_status
) from public, anon;
grant execute on function public.advance_provider_intervention(
  uuid,
  public.intervention_status
) to authenticated;

create or replace function public.list_provider_interventions()
returns table (
  id uuid,
  service public.request_service,
  vehicle jsonb,
  city text,
  amount_minor integer,
  eta_minutes integer,
  status public.intervention_status,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    interventions.id,
    request_drafts.service,
    jsonb_build_object(
      'make', request_drafts.vehicle ->> 'make',
      'model', request_drafts.vehicle ->> 'model'
    ),
    request_drafts.location ->> 'city',
    interventions.amount_minor,
    interventions.eta_minutes,
    interventions.status,
    interventions.updated_at
  from public.interventions
  join public.request_drafts on request_drafts.id = interventions.request_id
  where interventions.provider_id = (select auth.uid())
  order by
    case interventions.status
      when 'assigned' then 1
      when 'en_route' then 2
      when 'arrived' then 3
      else 4
    end,
    interventions.updated_at desc;
$$;

revoke all on function public.list_provider_interventions() from public, anon;
grant execute on function public.list_provider_interventions() to authenticated;

comment on table public.intervention_events is
  'Append-only history of intervention status transitions.';
comment on function public.advance_provider_intervention(
  uuid,
  public.intervention_status
) is 'Advances an intervention by one valid step for its assigned provider.';
comment on function public.list_provider_interventions() is
  'Lists interventions assigned to the authenticated provider.';
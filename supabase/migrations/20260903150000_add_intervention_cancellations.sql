create type public.cancellation_reason as enum (
  'client_changed_mind',
  'problem_resolved',
  'provider_late',
  'provider_vehicle_issue',
  'unsafe_location',
  'client_no_show'
);

alter table public.interventions
add column cancelled_by uuid references public.profiles (id),
add column cancellation_reason public.cancellation_reason,
add column cancelled_at timestamptz,
add constraint interventions_cancellation_consistency check (
  (
    status = 'cancelled'
    and cancelled_by is not null
    and cancellation_reason is not null
    and cancelled_at is not null
  )
  or
  (
    status <> 'cancelled'
    and cancelled_by is null
    and cancellation_reason is null
    and cancelled_at is null
  )
);

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
  cancellation_reason public.cancellation_reason,
  cancelled_by_role text,
  cancelled_at timestamptz,
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
    interventions.cancellation_reason,
    case
      when interventions.cancelled_by = interventions.provider_id then 'provider'
      when interventions.cancelled_by = interventions.client_id then 'client'
      else null
    end,
    interventions.cancelled_at,
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

create or replace function public.cancel_participant_intervention(
  p_intervention_id uuid,
  p_reason public.cancellation_reason
)
returns public.intervention_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_intervention public.interventions;
  v_role text;
begin
  select * into v_intervention
  from public.interventions
  where interventions.id = p_intervention_id
    and (select auth.uid()) in (
      interventions.client_id,
      interventions.provider_id
    )
  for update;

  if not found then
    raise exception 'INTERVENTION_NOT_AVAILABLE';
  end if;

  if v_intervention.status in ('completed', 'cancelled') then
    raise exception 'INTERVENTION_ALREADY_CLOSED';
  end if;

  v_role := case
    when v_intervention.provider_id = (select auth.uid()) then 'provider'
    else 'client'
  end;

  if v_role = 'client' and p_reason not in (
    'client_changed_mind',
    'problem_resolved',
    'provider_late'
  ) then
    raise exception 'INVALID_CANCELLATION_REASON';
  end if;

  if v_role = 'provider' and p_reason not in (
    'provider_vehicle_issue',
    'unsafe_location',
    'client_no_show'
  ) then
    raise exception 'INVALID_CANCELLATION_REASON';
  end if;

  if p_reason = 'client_no_show' and v_intervention.status <> 'arrived' then
    raise exception 'NO_SHOW_REQUIRES_ARRIVAL';
  end if;

  update public.interventions
  set
    status = 'cancelled',
    cancelled_by = (select auth.uid()),
    cancellation_reason = p_reason,
    cancelled_at = now()
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
    'cancelled'
  );

  return 'cancelled';
end;
$$;

revoke all on function public.cancel_participant_intervention(
  uuid,
  public.cancellation_reason
) from public, anon;
grant execute on function public.cancel_participant_intervention(
  uuid,
  public.cancellation_reason
) to authenticated;

comment on function public.cancel_participant_intervention(
  uuid,
  public.cancellation_reason
) is 'Cancels an active intervention with a role-appropriate audited reason.';
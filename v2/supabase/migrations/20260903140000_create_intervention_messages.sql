create type public.message_sender_role as enum ('client', 'provider');

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  intervention_id uuid not null references public.interventions (id) on delete cascade,
  sender_id uuid not null references public.profiles (id),
  sender_role public.message_sender_role not null,
  body text not null,
  created_at timestamptz not null default now(),
  constraint messages_body_length check (char_length(body) between 1 and 500)
);

create index messages_intervention_created_idx
on public.messages (intervention_id, created_at, id);

alter table public.messages enable row level security;

create policy "messages_select_participant"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.interventions
    where interventions.id = messages.intervention_id
      and (select auth.uid()) in (
        interventions.client_id,
        interventions.provider_id
      )
  )
);

revoke all on table public.messages from public, anon, authenticated;
grant select on table public.messages to authenticated;
grant select, insert on table public.messages to service_role;

create or replace function public.send_intervention_message(
  p_intervention_id uuid,
  p_body text
)
returns public.messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_intervention public.interventions;
  v_message public.messages;
  v_body text;
begin
  v_body := trim(coalesce(p_body, ''));
  if char_length(v_body) not between 1 and 500 then
    raise exception 'INVALID_MESSAGE';
  end if;

  select * into v_intervention
  from public.interventions
  where interventions.id = p_intervention_id
    and (select auth.uid()) in (
      interventions.client_id,
      interventions.provider_id
    );

  if not found then
    raise exception 'INTERVENTION_NOT_AVAILABLE';
  end if;

  if v_intervention.status in ('completed', 'cancelled') then
    raise exception 'INTERVENTION_CLOSED';
  end if;

  insert into public.messages (
    intervention_id,
    sender_id,
    sender_role,
    body
  ) values (
    v_intervention.id,
    (select auth.uid()),
    case
      when v_intervention.provider_id = (select auth.uid())
        then 'provider'::public.message_sender_role
      else 'client'::public.message_sender_role
    end,
    v_body
  )
  returning * into v_message;

  return v_message;
end;
$$;

revoke all on function public.send_intervention_message(uuid, text)
from public, anon;
grant execute on function public.send_intervention_message(uuid, text)
to authenticated;

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.interventions;

comment on table public.messages is
  'Participant-only messages exchanged during an active intervention.';
comment on function public.send_intervention_message(uuid, text) is
  'Sends a validated message as the authenticated intervention participant.';
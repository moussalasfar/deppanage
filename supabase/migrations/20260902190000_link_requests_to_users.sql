alter table public.request_drafts
add column user_id uuid references public.profiles (id) on delete set null;

create index request_drafts_user_id_idx
on public.request_drafts (user_id)
where user_id is not null;

create policy "request_drafts_select_own"
on public.request_drafts
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "request_photos_select_own"
on public.request_photos
for select
to authenticated
using (
  exists (
    select 1
    from public.request_drafts
    where request_drafts.id = request_photos.request_id
      and request_drafts.user_id = (select auth.uid())
  )
);

grant select on table public.request_drafts to authenticated;
grant select on table public.request_photos to authenticated;

comment on column public.request_drafts.user_id is
  'Authenticated owner assigned after OTP verification. Only unclaimed requests may be linked.';
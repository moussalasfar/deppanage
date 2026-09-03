create type public.request_service as enum ('battery', 'tire', 'towing', 'other');
create type public.request_status as enum ('draft', 'published');

create table public.request_drafts (
  id uuid primary key,
  owner_session_hash text not null,
  service public.request_service not null,
  status public.request_status not null default 'draft',
  vehicle jsonb not null,
  location jsonb,
  details jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint request_drafts_owner_session_hash_format
    check (owner_session_hash ~ '^[a-f0-9]{64}$'),
  constraint request_drafts_vehicle_object check (jsonb_typeof(vehicle) = 'object'),
  constraint request_drafts_location_object
    check (location is null or jsonb_typeof(location) = 'object'),
  constraint request_drafts_details_object
    check (details is null or jsonb_typeof(details) = 'object'),
  constraint request_drafts_publication_consistency check (
    (status = 'draft' and published_at is null)
    or
    (status = 'published' and published_at is not null and location is not null and details is not null)
  )
);

create index request_drafts_owner_session_hash_idx
on public.request_drafts (owner_session_hash);

create table public.request_photos (
  id uuid primary key,
  request_id uuid not null references public.request_drafts (id) on delete cascade,
  object_path text not null unique,
  file_name text not null,
  content_type text not null,
  byte_size integer not null,
  created_at timestamptz not null default now(),
  constraint request_photos_file_name_length check (char_length(file_name) between 1 and 120),
  constraint request_photos_content_type check (
    content_type in ('image/jpeg', 'image/png', 'image/webp')
  ),
  constraint request_photos_byte_size check (byte_size between 1 and 5242880)
);

comment on table public.request_drafts is
  'Anonymous assistance request drafts. Access is restricted to the trusted server repository.';
comment on column public.request_drafts.owner_session_hash is
  'SHA-256 digest of the anonymous session identifier; the raw cookie is never persisted.';
comment on table public.request_photos is
  'Metadata for request photos stored in the private request-photos bucket.';

alter table public.request_drafts enable row level security;
alter table public.request_photos enable row level security;

revoke all on table public.request_drafts from public, anon, authenticated;
revoke all on table public.request_photos from public, anon, authenticated;
grant select, insert, update, delete on table public.request_drafts to service_role;
grant select, insert, update, delete on table public.request_photos to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'request-photos',
  'request-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
-- Voltec Supabase schema
-- Run this in the Supabase SQL editor (or via the CLI) once per project.

-- ============================ Blog posts ============================
create table if not exists public.posts (
  id              text primary key,
  title           text not null,
  slug            text not null unique,
  category        text not null default 'Technical',
  excerpt         text not null default '',
  cover           text default 'stripes-generic',
  author          text not null default 'Voltec Team',
  "authorRole"    text default 'Lahore Office',
  "readTime"      integer not null default 4,
  date            text not null,
  published       boolean not null default false,
  body            text not null default '',
  "metaTitle"     text,
  "metaDescription" text,
  keywords        jsonb default '[]'::jsonb,
  takeaways       jsonb default '[]'::jsonb,
  faqs            jsonb default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.posts enable row level security;

-- Public can read only published posts.
drop policy if exists "posts public read" on public.posts;
create policy "posts public read"
  on public.posts for select
  using (published = true);

-- Writes happen only through the server with the service-role key (bypasses RLS).

-- ===================== Living-site analytics events =====================
create table if not exists public.events (
  id          bigint generated always as identity primary key,
  event       text not null,
  path        text,
  referrer    text,
  params      jsonb default '{}'::jsonb,
  ip          text,
  ua          text,
  -- reverse-DNS / geo enrichment (filled server-side, best-effort)
  hostname    text,
  org         text,
  country     text,
  city        text,
  created_at  timestamptz not null default now()
);

create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_event_idx on public.events (event);
create index if not exists events_path_idx on public.events (path);

alter table public.events enable row level security;
-- No public policies: events are written and read only via the service role.

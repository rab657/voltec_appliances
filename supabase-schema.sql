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

-- ===========================================================================
-- Product overrides: admin-managed gallery images + variants per product.
-- The base product data lives in code (lib/products.ts); this table overlays
-- imagery/variants set in the admin portal (/admin/products).
-- ===========================================================================
create table if not exists public.product_overrides (
  product_id text primary key,
  images jsonb not null default '[]'::jsonb,  -- ["url", ...] first = primary/cover
  videos jsonb not null default '[]'::jsonb,  -- ["url", ...] YouTube/Vimeo or direct
  hidden boolean not null default false,      -- admin show/hide toggle
  price numeric,                              -- PKR; null = "Request price"
  name text,                                  -- display-name override (rename a variant)
  base_id text,                               -- created variants: code product to clone
  is_variant boolean not null default false,  -- true = admin-created variant (not in code)
  updated_at timestamptz not null default now()
);

-- For existing projects, add the later columns idempotently:
alter table public.product_overrides add column if not exists videos jsonb not null default '[]'::jsonb;
alter table public.product_overrides add column if not exists name text;
alter table public.product_overrides add column if not exists base_id text;
alter table public.product_overrides add column if not exists is_variant boolean not null default false;

alter table public.product_overrides enable row level security;
-- Public can read overrides (the storefront renders them); writes are server-only
-- via the service-role key (admin API), which bypasses RLS.
drop policy if exists "product_overrides public read" on public.product_overrides;
create policy "product_overrides public read"
  on public.product_overrides for select using (true);

-- Image storage: a PUBLIC bucket named "product-images" for the admin uploader.
-- Created here so the whole setup is a single SQL run. The admin upload API
-- writes with the service-role key (bypasses RLS); the public can read.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product-images public read" on storage.objects;
create policy "product-images public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

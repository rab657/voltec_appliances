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

-- ===========================================================================
-- Orders: direct-purchase (bank-transfer) checkout for the AC line.
-- Flow: customer places order -> gets bank details -> transfers -> shares
-- receipt + confirms on WhatsApp -> Voltec verifies (status) -> ships.
-- Written + read server-side via the service-role key (RLS on, no public policy)
-- so order details are never publicly queryable — only via the server + ref.
-- ===========================================================================
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  order_ref     text not null unique,       -- human code, e.g. VLT-7K3Q2
  model         text not null,              -- R2 / R3 / R4
  product_name  text not null,
  unit_price    numeric not null,           -- PKR, server-derived
  qty           integer not null default 1,
  total         numeric not null,           -- PKR
  customer_name text not null,
  phone         text not null,
  address       text not null,
  city          text not null,
  status        text not null default 'pending_payment',  -- pending_payment | receipt_sent | confirmed | shipped | cancelled
  notes         text,
  created_at    timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

alter table public.orders enable row level security;
-- No public policies: orders are written and read only via the service role.

-- ===========================================================================
-- WhatsApp CTWA leads + messages (added 2026-07-31).
--
-- WHY: click-to-WhatsApp ads are the whole funnel, but Meta only tells us a
-- "conversation started" — and on 2026-07-31 we proved that count can be ~59x
-- inflated. The fix is to capture the real inbound message ourselves and, most
-- importantly, the **ctwa_clid** that Meta puts in the message's `referral`
-- payload. That click id is what lets us post a *qualified lead* event back via
-- the Conversions API, so Meta optimises for real assemblers instead of whoever
-- is cheapest to make say hello.
--
-- Requires the PK number to be on WhatsApp **Cloud API** with a webhook
-- subscribed. Until that migration happens these tables simply stay empty.
-- Service-role only (RLS on, no public policy) — this is customer PII.
-- ===========================================================================
create table if not exists public.whatsapp_leads (
  id            uuid primary key default gen_random_uuid(),
  wa_id         text not null,              -- customer WhatsApp id (digits)
  profile_name  text,                       -- name from the webhook contact profile
  ctwa_clid     text,                       -- CTWA click id = the attribution key
  source_id     text,                       -- referral.source_id (the ad id)
  source_type   text,                       -- referral.source_type (ad | post)
  source_url    text,
  headline      text,                       -- which creative they came from
  body          text,
  first_message text,
  message_count integer not null default 0,
  -- Lead quality, set by a human (or later by order data), then fed back to Meta.
  quality       text not null default 'unknown',   -- unknown | qualified | rejected | bought
  quality_note  text,
  qualified_at  timestamptz,
  capi_event    text,                       -- which event we posted back
  capi_sent_at  timestamptz,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

-- One row per (person, click). coalesce so organic (no-referral) chats still
-- get exactly one row per person instead of duplicating on every message.
create unique index if not exists whatsapp_leads_wa_clid_uidx
  on public.whatsapp_leads (wa_id, coalesce(ctwa_clid, ''));
create index if not exists whatsapp_leads_quality_idx on public.whatsapp_leads (quality);
create index if not exists whatsapp_leads_last_seen_idx on public.whatsapp_leads (last_seen_at desc);

-- Full message log. Not optional: once the number moves to Cloud API the
-- WhatsApp Business phone app stops working on it, so this becomes the only
-- place the conversation can be read.
create table if not exists public.whatsapp_messages (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid references public.whatsapp_leads (id) on delete cascade,
  wa_id        text not null,
  message_id   text not null unique,        -- WhatsApp wamid — dedupes webhook retries
  direction    text not null default 'in',  -- in | out
  type         text,                        -- text | image | audio | ...
  body         text,
  raw          jsonb,
  sent_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists whatsapp_messages_wa_id_idx on public.whatsapp_messages (wa_id, sent_at desc);
create index if not exists whatsapp_messages_lead_idx on public.whatsapp_messages (lead_id);

alter table public.whatsapp_leads enable row level security;
alter table public.whatsapp_messages enable row level security;
-- No public policies: customer PII, service role only.

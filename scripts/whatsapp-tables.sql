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
create unique index if not exists whatsapp_leads_wa_clid_uidx
  on public.whatsapp_leads (wa_id, coalesce(ctwa_clid, ''));
create index if not exists whatsapp_leads_quality_idx on public.whatsapp_leads (quality);
create index if not exists whatsapp_leads_last_seen_idx on public.whatsapp_leads (last_seen_at desc);
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

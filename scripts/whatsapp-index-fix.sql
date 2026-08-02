-- FIX (2026-07-31): the original unique index was on an EXPRESSION,
--   (wa_id, coalesce(ctwa_clid, ''))
-- but the webhook upserts with onConflict "wa_id,ctwa_clid". Postgres cannot
-- infer an expression index from a plain column list, so every write failed with
--   "there is no unique or exclusion constraint matching the ON CONFLICT specification"
-- and the webhook silently stored nothing (it still 200s, by design).
--
-- Replace it with a plain two-column unique index using NULLS NOT DISTINCT (PG15+),
-- which keeps the original intent — organic chats with no ctwa_clid must still
-- collapse to ONE row per person, instead of one row per message.
drop index if exists whatsapp_leads_wa_clid_uidx;

create unique index if not exists whatsapp_leads_wa_clid_uidx
  on public.whatsapp_leads (wa_id, ctwa_clid) nulls not distinct;

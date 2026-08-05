#!/usr/bin/env python3
"""Feed WhatsApp lead QUALITY back into Meta, so it optimises for real buyers.

THE POINT (2026-07-31): Meta's CTWA optimisation only knows "a conversation
started". It cannot tell a battery-pack assembler ordering a carton from a DIY
buyer who wants 4 cells — which is exactly the complaint that triggered the
audience rebuild. The `ctwa_clid` captured by app/api/whatsapp/webhook closes
that loop: mark a lead qualified here and we post a Conversions API event with
`action_source: "business_messaging"` tied to that click, and Meta starts
buying people who resemble your *good* leads instead of your cheapest hellos.

This is strictly better than the interest/behaviour targeting we shipped today,
because it learns quality from real outcomes rather than guessing at it.

⚠️ PREREQUISITES — none of this does anything until they are true:
   1. PK number +92 321 1644447 migrated ON_PREMISE → CLOUD_API
   2. Webhook subscribed:  POST /1051206810604714/subscribed_apps
   3. Supabase tables created (see supabase-schema.sql, whatsapp_leads)
   Until then `list` will simply show nothing.

PAYLOAD SHAPE verified live 2026-08-06: business_messaging events require
event_name "LeadSubmitted" (NOT "Lead" — err 2804066) or "Purchase". A 200 means
accepted; confirm attribution in Events Manager.

Usage:
  python3 scripts/whatsapp-qualify.py list [unknown|qualified|rejected|bought]
  python3 scripts/whatsapp-qualify.py qualify <wa_id> [--note "real assembler"] [--dry-run]
  python3 scripts/whatsapp-qualify.py bought  <wa_id> [--value 84000] [--dry-run]
  python3 scripts/whatsapp-qualify.py reject  <wa_id> [--note "wanted 4 cells"]
"""
import json, os, pathlib, sys, time, urllib.parse, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
CFG = {}
for line in ROOT.joinpath(".env.local").read_text().splitlines():
    line = line.strip()
    if line and "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); CFG[k.strip()] = v.strip().strip('"').strip("'")

SB_URL = CFG.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
SB_KEY = CFG.get("SUPABASE_SERVICE_ROLE_KEY", "")
# CTWA quality events go to the WABA-OWNED dataset, NOT the website pixel —
# the pixel has no WhatsApp Business account associated (err 2804132). Created
# via POST /{waba}/dataset on 2026-08-06.
PIXEL = "1969968263652773"
CAPI = CFG.get("META_ADS_TOKEN") or CFG.get("META_CAPI_TOKEN", "")
VER = CFG.get("META_GRAPH_VERSION", "v21.0")
WABA = "1051206810604714"   # PK WhatsApp Business Account — required in business_messaging events (err 2804116)


def sb(method, path, body=None, **params):
    if not SB_URL or not SB_KEY:
        raise SystemExit("Supabase not configured in .env.local")
    url = f"{SB_URL}/rest/v1/{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(
        url, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
                 "Content-Type": "application/json", "Prefer": "return=representation"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            txt = r.read().decode()
            return json.loads(txt) if txt else []
    except urllib.error.HTTPError as e:
        raise SystemExit(f"Supabase {method} {path} failed: {e.read().decode()[:400]}")


def find(wa_id):
    rows = sb("GET", "whatsapp_leads", select="*", wa_id=f"eq.{wa_id}",
              order="last_seen_at.desc")
    if not rows:
        raise SystemExit(f"No lead found for wa_id {wa_id}. Run `list` to see what exists.")
    # A person can hold several rows (one per ad click + an organic one). Prefer the
    # attributed row — the ctwa_clid is the whole point of posting quality to Meta.
    return next((r for r in rows if r.get("ctwa_clid")), rows[0])


def post_capi(lead, event_name, value=None, dry=False):
    """Post the quality signal back to Meta against the original ad click."""
    clid = lead.get("ctwa_clid")
    if not clid:
        print(f"  ⚠️  lead has no ctwa_clid (organic chat, or pre-webhook) — "
              f"nothing to attribute; marking locally only.")
        return None
    event = {
        "event_name": event_name,
        "event_time": int(time.time()),
        "action_source": "business_messaging",
        "messaging_channel": "whatsapp",
        "user_data": {"ctwa_clid": clid, "whatsapp_business_account_id": WABA},
    }
    if value is not None:
        event["custom_data"] = {"value": float(value), "currency": "PKR"}
    payload = {"data": [event]}
    if dry:
        print("  DRY RUN — would POST to "
              f"https://graph.facebook.com/{VER}/{PIXEL}/events\n"
              + json.dumps(payload, indent=2))
        return "dry-run"
    if not CAPI:
        print("  ⚠️  META_CAPI_TOKEN missing — cannot post. Marked locally only.")
        return None
    req = urllib.request.Request(
        f"https://graph.facebook.com/{VER}/{PIXEL}/events?access_token={urllib.parse.quote(CAPI)}",
        data=json.dumps(payload).encode(), method="POST",
        headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            res = json.loads(r.read())
        print(f"  ✓ CAPI accepted: {json.dumps(res)}")
        print("  → VERIFY in Events Manager; a 200 does not prove attribution.")
        return event_name
    except urllib.error.HTTPError as e:
        print(f"  ✗ CAPI rejected: {e.read().decode()[:400]}")
        return None


def mark(wa_id, quality, event_name=None, value=None, note=None, dry=False):
    lead = find(wa_id)
    print(f"{wa_id} · {lead.get('profile_name') or '(no name)'} · "
          f"msgs {lead.get('message_count')} · from ad {lead.get('source_id') or '-'}")
    print(f"  first message: {str(lead.get('first_message'))[:80]}")
    sent = post_capi(lead, event_name, value, dry) if event_name else None
    if dry:
        print("  DRY RUN — no database change made.")
        return
    patch = {"quality": quality, "qualified_at": "now()"}
    if note: patch["quality_note"] = note
    if sent and sent != "dry-run":
        patch["capi_event"] = sent
        patch["capi_sent_at"] = "now()"
    # Mark EVERY row of this person, not just the matched one — otherwise their
    # organic row keeps resurfacing on the daily list after they're classified.
    sb("PATCH", "whatsapp_leads", body=patch, wa_id=f"eq.{lead['wa_id']}")
    print(f"  ✓ marked {quality}")


def cmd_list(quality="unknown"):
    rows = sb("GET", "whatsapp_leads", select="*", quality=f"eq.{quality}",
              order="last_seen_at.desc", limit="50")
    if not rows:
        print(f"No leads with quality='{quality}'.")
        print("If you expected some: the webhook only fills this once the PK number is on "
              "Cloud API with a subscribed app. See the header of this file.")
        return
    print(f"{'wa_id':<16}{'msgs':<6}{'clid?':<7}{'ad':<20}name / first message")
    for r in rows:
        print(f"{r.get('wa_id',''):<16}{str(r.get('message_count','')):<6}"
              f"{'yes' if r.get('ctwa_clid') else 'NO':<7}{str(r.get('source_id') or '-'):<20}"
              f"{(r.get('profile_name') or '?')[:18]} | {str(r.get('first_message') or '')[:40]}")
    print(f"\n{len(rows)} lead(s). 'clid? NO' = cannot be fed back to Meta (organic or "
          f"arrived before the webhook existed).")


args = sys.argv[1:]
cmd = args[0] if args else "list"
dry = "--dry-run" in args
note = args[args.index("--note") + 1] if "--note" in args else None
val = args[args.index("--value") + 1] if "--value" in args else None
pos = [a for a in args[1:] if not a.startswith("--")
       and a not in {note, val}]

if cmd == "list":
    cmd_list(pos[0] if pos else "unknown")
elif cmd == "qualify":
    mark(pos[0], "qualified", "LeadSubmitted", None, note, dry)
elif cmd == "bought":
    mark(pos[0], "bought", "Purchase", val, note, dry)
elif cmd == "reject":
    mark(pos[0], "rejected", None, None, note, dry)
else:
    print(__doc__)

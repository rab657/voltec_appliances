#!/usr/bin/env python3
"""Daily WhatsApp lead report — who went quiet, ranked by what they asked for.

FRAMING (corrected by the user 2026-08-01): leads are NOT unattended. Voltec replies
instantly. So this is NOT a "you forgot to answer" list — it is a **re-engagement
list**: people who asked, got an answer, and then went silent. The user's own inbox
audit found that is 70-75% of all leads, and that they are worth a nudge.

Ranked by requested quantity because the inbox audit showed the highest-value
conversations (10 cartons, 80 cartons, 50 pcs) were the ones going cold.

⚠️ Only INBOUND messages exist in the database — the webhook receives what customers
send, not what Voltec sends back. So "quiet" here means **the customer has not written
in N hours**, which is the signal we actually want for re-engagement. Do not read it
as "unanswered".

Usage:
  python3 scripts/whatsapp-daily.py              # quiet >= 24h, unknown quality
  python3 scripts/whatsapp-daily.py 48           # quiet >= 48h
  python3 scripts/whatsapp-daily.py 0 all        # everything, any quality
"""
import json, pathlib, re, sys, urllib.parse, urllib.request
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parent.parent
CFG = {}
for line in (ROOT / ".env.local").read_text().splitlines():
    line = line.strip()
    if line and "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); CFG[k.strip()] = v.strip().strip('"').strip("'")
U = CFG["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
K = CFG["SUPABASE_SERVICE_ROLE_KEY"]
H = {"apikey": K, "Authorization": f"Bearer {K}"}

CELL_PRICE = 9700   # what sales actually quote (site lists 10,000; 9,700 on WhatsApp)
CARTON = 8

def get(table, **params):
    url = f"{U}/rest/v1/{table}?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(urllib.request.Request(url, headers=H), timeout=60) as r:
        return json.loads(r.read())

# Quantity extraction. Roman-Urdu chats mix English numerals with "carton"/"cartoon"/
# "pcs"/"cell", so match a number followed by any of those within a few characters.
QTY = re.compile(r"(\d{1,4})\s*(?:x\s*)?(cartoon|carton|ctn|pcs|pc|piece|pieces|cell|cells|adad)",
                 re.IGNORECASE)

def requested_cells(text: str) -> int:
    """Best-effort: largest quantity mentioned, normalised to cells."""
    best = 0
    for n, unit in QTY.findall(text or ""):
        n = int(n)
        if n > 5000:            # nonsense / phone numbers
            continue
        u = unit.lower()
        cells = n * CARTON if u.startswith(("carton", "cartoon", "ctn")) else n
        best = max(best, cells)
    return best

def hours_since(ts: str) -> float:
    if not ts: return 1e9
    # Supabase emits variable-precision fractions ('.89', '.58254') that Python
    # 3.9's fromisoformat rejects — strip them; hour precision is all we need.
    ts = re.sub(r"\.\d+", "", ts).replace("Z", "+00:00")
    t = datetime.fromisoformat(ts)
    return (datetime.now(timezone.utc) - t).total_seconds() / 3600


quiet_h = float(sys.argv[1]) if len(sys.argv) > 1 else 24.0
which = sys.argv[2] if len(sys.argv) > 2 else "unknown"

leads = get("whatsapp_leads", select="*", order="last_seen_at.desc")
if not leads:
    print("No WhatsApp leads recorded yet.\n"
          "The webhook is live but nothing has arrived — the tables fill from the next\n"
          "click-to-WhatsApp message onward. Check the ads are delivering, then re-run.")
    raise SystemExit(0)

msgs = get("whatsapp_messages", select="wa_id,body,sent_at")
by_wa = {}
for m in msgs:
    by_wa.setdefault(m["wa_id"], []).append(m)

rows = []
for l in leads:
    if which != "all" and l.get("quality") != which:
        continue
    quiet = hours_since(l.get("last_seen_at"))
    if quiet < quiet_h:
        continue
    text = " ".join([l.get("first_message") or ""] +
                    [m.get("body") or "" for m in by_wa.get(l["wa_id"], [])])
    cells = requested_cells(text)
    rows.append({**l, "quiet_h": quiet, "cells": cells, "value": cells * CELL_PRICE,
                 "text": text.strip()})

rows.sort(key=lambda r: (-r["value"], -r["quiet_h"]))

print(f"\n  WHATSAPP RE-ENGAGEMENT LIST — quiet {quiet_h:.0f}h+, quality '{which}'")
print(f"  {len(rows)} of {len(leads)} lead(s)\n")
if not rows:
    print("  Nothing to chase. Everyone has written recently or is already classified.\n")
    raise SystemExit(0)

print(f"  {'#':<3}{'number':<16}{'quiet':>7}  {'asked':>9}  {'≈ value':>11}  from ad")
print("  " + "-" * 88)
pipeline = 0
for i, r in enumerate(rows, 1):
    pipeline += r["value"]
    asked = f"{r['cells']} cells" if r["cells"] else "—"
    val = f"Rs {r['value']:,}" if r["value"] else "—"
    print(f"  {i:<3}{r['wa_id']:<16}{r['quiet_h']:>6.0f}h  {asked:>9}  {val:>11}  "
          f"{(r.get('source_id') or '-')[:18]}")
    who = r.get("profile_name") or "?"
    print(f"     {who} · \"{r['text'][:70]}\"")
    print(f"     open: https://wa.me/{r['wa_id']}"
          + (f"  · clid {r['ctwa_clid'][:14]}" if r.get("ctwa_clid") else "  · no clid (organic)"))
print("  " + "-" * 88)
print(f"  Estimated pipeline in this list: Rs {pipeline:,}  (at Rs {CELL_PRICE:,}/cell)\n")
print("  After you talk to someone, classify them so they drop off this list:")
print("    python3 scripts/whatsapp-qualify.py qualify <wa_id>   # real assembler/dealer")
print("    python3 scripts/whatsapp-qualify.py bought  <wa_id> --value <PKR>")
print("    python3 scripts/whatsapp-qualify.py reject  <wa_id> --note \"wanted 4 cells\"\n")

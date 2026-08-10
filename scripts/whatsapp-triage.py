#!/usr/bin/env python3
"""Triage the WhatsApp inbox so Raheel's ATTENTION goes only where money is.

WHY THIS EXISTS (user, 2026-08-10): "honestly speaking - i've tried doing it. it
doesn't work for Pakistani awaam. They'll still ask again." Qualifying prompts and
welcome-message screening are ruled out — people ignore them and re-ask "price?".
87% of leads say nothing but "price?", so the lead itself carries no signal.

So we stop trying to make buyers qualify themselves, and instead make each
unqualified ping cost ~zero seconds:

  A-LIST   named a real quantity (>= 1 carton) → reply personally, these are deals
  CANNED   no signal, just "price?"            → send the ready-made block below
  DROP     asked < 8 cells / DIY build         → send the MOQ line, then
                                                 `whatsapp-qualify.py reject` them
                                                 (that also adds them to the Meta
                                                 exclusion audience, so ad money
                                                 stops chasing them)

Prints ready-to-copy replies. Nothing is sent automatically — bulk-messaging the
lead line risks the WhatsApp ban that would take the whole funnel down.

Usage:
  python3 scripts/whatsapp-triage.py            # last 24h
  python3 scripts/whatsapp-triage.py 72         # last 72h
"""
import json, pathlib, re, sys, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone

ROOT = pathlib.Path(__file__).resolve().parent.parent
CFG = {}
for line in (ROOT / ".env.local").read_text().splitlines():
    line = line.strip()
    if line and "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); CFG[k.strip()] = v.strip().strip('"').strip("'")
SB, KEY = CFG["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/"), CFG["SUPABASE_SERVICE_ROLE_KEY"]
PKT = timezone(timedelta(hours=5))

# The canned block. States MOQ so sub-carton buyers self-drop, and asks for the two
# facts a quote needs — without pretending they will answer.
CANNED = """EVE LF100LA Grade A — original cell, 3.2V 100Ah.
5,000+ cycles · QR-traceable · test report har batch ke saath.

Minimum order: 1 carton = 8 cells. Single cell available nahi.
Rate carton par depend karta hai — quantity batayein to exact rate bhej deta hoon.
Pack kis liye hai (12V / 24V / 48V)?

Voltec Appliances, Lahore (1995 se) — showroom: 8/26 Shadab Colony, Abid Market.
Mon-Sat 10am-8pm."""

MOQ_ONLY = ("Bhai minimum 1 carton = 8 cells hai, single ya 4 cells available nahi. "
            "Agar 8 ya us se zyada chahiye to rate bhej deta hoon.")

QTY = re.compile(r"(\d{1,4})\s*(?:x\s*)?(cartoon|carton|ctn|pcs|pc|piece|pieces|cell|cells|adad)", re.I)
BOILER = re.compile(r"Hello! Can I get more info on this\??", re.I)
DIY = re.compile(r"\b(diy|apne liye|apne ghar|ghar ke liye|personal|hobby|1 cell|ek cell|"
                 r"sampling|test kar|bike|scooter|rickshaw|12v ups)\b", re.I)
BIG = re.compile(r"\b(280|304|314|306|230)\s*(a|ah|amp)?\b|\bmb31\b", re.I)


def get(table, **params):
    """Paged fetch. ⚠️ PostgREST caps a response at 1000 rows and does NOT tell you —
    an unpaged read silently truncates and every total downstream comes out wrong."""
    out, step, off = [], 1000, 0
    while True:
        p = dict(params); p["limit"] = step; p["offset"] = off
        url = f"{SB}/rest/v1/{table}?" + urllib.parse.urlencode(p)
        req = urllib.request.Request(url, headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"})
        with urllib.request.urlopen(req, timeout=90) as r:
            batch = json.loads(r.read())
        out += batch
        if len(batch) < step:
            return out
        off += step


def cells(text):
    best = 0
    for n, u in QTY.findall(text or ""):
        n = int(n)
        if n > 5000:
            continue
        best = max(best, n * 8 if u.lower().startswith(("carton", "cartoon", "ctn")) else n)
    return best


def main():
    hours = int(sys.argv[1]) if len(sys.argv) > 1 else 24
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    leads = get("whatsapp_leads", select="*", order="first_seen_at.desc")
    msgs = get("whatsapp_messages", select="wa_id,body,created_at")
    body = {}
    for m in msgs:
        body.setdefault(m["wa_id"], []).append(m.get("body") or "")

    def ts(s):
        return datetime.fromisoformat(re.sub(r"\.\d+", "", s.replace("Z", "+00:00")))

    # one row per person; keep the attributed row's clid
    people = {}
    for l in leads:
        p = people.setdefault(l["wa_id"], dict(l))
        if l.get("ctwa_clid") and not p.get("ctwa_clid"):
            p["ctwa_clid"] = l["ctwa_clid"]
        if l.get("profile_name") and not p.get("profile_name"):
            p["profile_name"] = l["profile_name"]
        if l.get("quality") != "unknown":
            p["quality"] = l["quality"]
        p["_seen"] = max(ts(l["first_seen_at"]), ts(p.get("first_seen_at", l["first_seen_at"])))

    a_list, canned, drop, gap = [], [], [], []
    for wa, p in people.items():
        if p["quality"] in ("bought", "rejected"):
            continue
        last = max([p["_seen"]] + [ts(m["created_at"]) for m in msgs if m["wa_id"] == wa],
                   default=p["_seen"])
        if last < since:
            continue
        text = BOILER.sub("", " ".join([p.get("first_message") or ""] + body.get(wa, []))).strip()
        n = cells(text)
        row = (n, p.get("profile_name") or "?", wa, text[:60], last.astimezone(PKT).strftime("%d %H:%M"))
        if BIG.search(text):
            gap.append(row)            # wants 280/314Ah — a stock decision, not a sales one
        elif n >= 8:
            a_list.append(row)
        elif n > 0 or DIY.search(text):
            drop.append(row)
        else:
            canned.append(row)
    a_list.sort(reverse=True); gap.sort(reverse=True)

    print(f"\n  INBOX TRIAGE — last {hours}h  ·  {len(a_list)+len(canned)+len(drop)+len(gap)} people")
    print(f"\n  🟢 A-LIST — reply personally ({len(a_list)}); Rs {sum(r[0] for r in a_list)*9400:,} at 9,400")
    for n, name, wa, txt, when in a_list:
        print(f"    {n:>4} cells · {name[:18]:<19} wa.me/{wa} · {when} · {txt}")
    print(f"\n  📋 CANNED — paste the block below, no thinking ({len(canned)})")
    for n, name, wa, txt, when in canned[:15]:
        print(f"         {name[:18]:<19} wa.me/{wa} · {when} · {txt[:44]}")
    if len(canned) > 15:
        print(f"         … +{len(canned)-15} more (all get the same block)")
    print(f"\n  🔴 DROP — send the MOQ line, then reject ({len(drop)})")
    for n, name, wa, txt, when in drop:
        print(f"    {(n or '-'):>4}      {name[:18]:<19} wa.me/{wa} · {txt[:44]}")
    if drop:
        print("\n    then, to stop paying to reach them again:")
        for _, _, wa, _, _ in drop:
            print(f"      python3 scripts/whatsapp-qualify.py reject {wa} --note 'sub-carton/DIY'")
    if gap:
        print(f"\n  ⚠️ WANTS 280/314Ah — NOT STOCKED ({len(gap)}) · sourcing decision, not a reply")
        for n, name, wa, txt, when in gap:
            print(f"    {(n or '?'):>4} · {name[:18]:<19} wa.me/{wa} · {txt[:44]}")
    print("\n" + "─" * 72 + "\n  CANNED REPLY (copy once, save as a WhatsApp quick reply):\n")
    print("  " + CANNED.replace("\n", "\n  "))
    print("\n  SUB-CARTON REPLY:\n\n  " + MOQ_ONLY)
    print("\n  ⚠️ Send by hand from the app. Never bulk-blast — the lead line is the whole funnel.\n")


main()

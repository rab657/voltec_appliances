#!/usr/bin/env python3
"""EVE cells — "ask for the test report" ads, built onto the existing v3 campaign.

Raheel, 2026-09-22: "create an ad for our lithium cells (we need more engagement
and leads please)".

WHY THIS ANGLE: on 2026-09-21 we published /blog/eve-cells-original-test-report —
the QR code is no longer proof a cell is new, because re-lasering a code is a cheap
trade service, so the batch test report is the document to demand. That is the one
claim in this market that competitors cannot copy cheaply: they would have to
actually produce per-cell measurements. It also matches what Google's AI Overview
ALREADY credits Voltec for ("direct importers ... stock fresh-manufactured batches
with accompanying factory test reports"), so paid and organic finally say one thing.
It supersedes the asli/naqli QR angle that Raheel ruled dead on 2026-08-05
("fakers caught up, buyers know it") — this is the honest successor to it.

WHY NO NEW CAMPAIGN: campaign 120249209819320617 is already built, correctly
targeted (Punjab, battery-assembler audiences + trade-AND-owner gate, male 25-54,
Facebook only, 09:00-22:00 viewer-local, DIY/sub-carton excluded) and — unlike the
SVC and v2 campaigns — its stop_time has NOT lapsed. Building a fourth cells
campaign would bid against itself; three earlier v3 builds were already deleted for
that reason. This only adds creative.

WHY THIS VIDEO: 2452679025241158 is the Aug-5 clip carrying EVE + Voltec logos, the
spec chip, the correct 0321-1644447 CTA and — the point — an IR-TESTER-OVER-CARTONS
PROOF SHOT. The copy claims every cell is measured; this is the footage that shows
it. Reused rather than re-cut so the creative is the only new variable, and because
the container clips (4549871848575792 / 1615910626717118) still carry unreviewed
spoken audio.
  ⚠️ It is 38.9s, which is long for feed. If these underperform, a 12-15s cut that
  opens on the tester touching a cell is the first thing to try.

Standing rules honoured: no price in creative (2026-07-27); simple product-first
copy, no clever hooks (2026-08-05); every placement click-to-WhatsApp (2026-07-31);
the 1-carton disqualifier in every variation (2026-08-10).

  python3 scripts/meta-cells-testreport-ad.py show     # what exists now
  python3 scripts/meta-cells-testreport-ad.py build    # create ads, PAUSED
  python3 scripts/meta-cells-testreport-ad.py activate # ad -> adset -> campaign
"""
import hashlib, hmac, json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV = {}
for line in (ROOT / ".env.local").read_text().splitlines():
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, v = line.split("=", 1)
        ENV[k.strip()] = v.strip().strip('"')

V = ENV.get("META_GRAPH_VERSION", "v21.0")
T = ENV["META_ADS_TOKEN"]
PROOF = hmac.new(ENV["META_APP_SECRET"].encode(), T.encode(), hashlib.sha256).hexdigest()
ACT = "act_" + ENV["META_AD_ACCOUNT_ID"].replace("act_", "")
PAGE = ENV["META_PAGE_ID"]

CAMPAIGN = "120249209819320617"          # Voltec - EVE Cells v3 CTWA (Punjab, assemblers)
VIDEO = "2452679025241158"               # IR-tester proof clip, 4:5, correct number baked in
THUMB = ROOT / "creatives" / "video" / "eve-v3-thumb.jpg"
STATE = ROOT / ".data" / "cells-testreport-ads.json"

# Two hooks on the same proof. A states the rule, B hands them the questions to ask
# — B qualifies harder, because a buyer who asks those four is a real assembler.
ADS = [
    {
        "key": "testreport",
        "name": "cells · test report is the proof",
        "headline": "EVE LF100LA — Test Report Ke Saath",
        "desc": "Har carton ke saath batch test report",
        "primary": (
            "EVE LF100LA Grade A — 3.2V 100Ah lithium cell.\n\n"
            "Sirf QR code ab kaafi nahi hai. Code dobara laser karwana sasta aur aam ho "
            "chuka hai — purana ya B-grade cell bhi theek scan karta hai.\n\n"
            "Asli proof batch ka TEST REPORT hai: har cell ki measured capacity, internal "
            "resistance aur serial number. Hum har carton ke saath dete hain — paise dene "
            "se pehle check kar lein.\n\n"
            "Assemblers aur dealers ke liye — minimum 1 carton (8 cells). Single cell "
            "available nahi.\n\n"
            "Abid Market, Lahore — khud aa kar test karein. Pakistan bhar delivery."
        ),
    },
    {
        "key": "questions",
        "name": "cells · four questions for any seller",
        "headline": "Cell Kharidne Se Pehle Yeh Poochein",
        "desc": "Jo seller yeh 4 jawab de sake, wahi asli hai",
        "primary": (
            "EVE LF100LA Grade A — 3.2V 100Ah lithium cell.\n\n"
            "Kisi bhi seller se yeh 4 sawal poochein:\n"
            "1. Is batch ki test report bhej sakte hain?\n"
            "2. Kya us mein har cell ki capacity aur internal resistance hai?\n"
            "3. Paise dene se pehle report ka serial cell se match kar sakta hoon?\n"
            "4. Meri testing report se na miley to kya hoga?\n\n"
            "Jo khud import karta hai, woh chaaron ka jawab deta hai. Hum dete hain.\n\n"
            "Assemblers aur dealers ke liye — minimum 1 carton (8 cells). Single cell "
            "available nahi. Pakistan bhar delivery ya Lahore showroom pickup."
        ),
    },
]


def api(path, method="GET", **p):
    a = ["curl", "-s", "--max-time", "120"] + (["-X", "POST"] if method == "POST" else ["-G"])
    a += [f"https://graph.facebook.com/{V}/{path}"]
    p.update(access_token=T, appsecret_proof=PROOF)
    for k, v in p.items():
        a += ["--data-urlencode", f"{k}={v}"]
    out = subprocess.run(a, capture_output=True, text=True).stdout
    try:
        return json.loads(out or "{}")
    except Exception:
        return {"raw": out[:400]}


def die(m, o=None):
    raise SystemExit(f"✗ {m}" + (f": {json.dumps(o)[:400]}" if o else ""))


def load():
    return json.loads(STATE.read_text()) if STATE.exists() else {}


def save(s):
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(s, indent=1))


def adsets():
    d = api(f"{CAMPAIGN}/adsets", fields="name,status,daily_budget", limit=25)
    if "data" not in d:
        die("could not read ad sets", d)
    return d["data"]


def show():
    c = api(CAMPAIGN, fields="name,status,effective_status,stop_time")
    print(f"\ncampaign {CAMPAIGN}  {c.get('status')}  stop={c.get('stop_time','none')}")
    print(f"  {c.get('name')}")
    total = 0
    for a in adsets():
        b = int(a.get("daily_budget") or 0) / 100
        total += b
        print(f"  adset {a['id']}  {a['status']:<7} AED {b:>6.2f}/day  {a['name'][:52]}")
    print(f"  → AED {total:.2f}/day when active")
    ads = api(f"{CAMPAIGN}/ads", fields="name,status", limit=50).get("data", [])
    print(f"\n  {len(ads)} ads on the campaign:")
    for a in ads:
        print(f"    {a['status']:<7} {a['id']}  {a['name'][:58]}")
    print()


def build():
    st = load()
    st.setdefault("ads", {})
    if not THUMB.exists():
        die(f"missing thumbnail {THUMB}")

    v = api(VIDEO, fields="status,length")
    if v.get("status", {}).get("video_status") != "ready":
        die(f"video {VIDEO} not ready", v)
    print(f"video {VIDEO} ready ({v.get('length')}s)")

    ih = api(f"{ACT}/adimages", "POST", filename=f"@{THUMB}")
    # curl needs a real file upload for adimages; fall back to the documented form.
    if not (ih.get("images") or {}):
        out = subprocess.run(
            ["curl", "-s", "-X", "POST", f"https://graph.facebook.com/{V}/{ACT}/adimages",
             "-F", f"filename=@{THUMB}", "-F", f"access_token={T}",
             "-F", f"appsecret_proof={PROOF}"],
            capture_output=True, text=True).stdout
        ih = json.loads(out or "{}")
    imgs = ih.get("images") or {}
    if not imgs:
        die("thumbnail upload failed", ih)
    thumb_hash = list(imgs.values())[0]["hash"]
    print(f"thumbnail hash {thumb_hash}")

    sets = [a for a in adsets()]
    for spec in ADS:
        k = spec["key"]
        if not st["ads"].get(k + ":creative"):
            story = {"page_id": PAGE, "video_data": {
                "video_id": VIDEO, "image_hash": thumb_hash,
                "message": spec["primary"], "title": spec["headline"],
                "link_description": spec["desc"],
                "call_to_action": {"type": "WHATSAPP_MESSAGE",
                                   "value": {"app_destination": "WHATSAPP",
                                             "link": "https://api.whatsapp.com/send"}}}}
            cre = api(f"{ACT}/adcreatives", "POST",
                      name=f"cells test-report · {k}",
                      object_story_spec=json.dumps(story))
            if not cre.get("id"):
                die(f"creative failed for {k}", cre)
            st["ads"][k + ":creative"] = cre["id"]
            save(st)
            print(f"  creative {cre['id']}  {spec['name']}")
        cid = st["ads"][k + ":creative"]
        for s in sets:
            tag = "assemblers" if "assembler" in s["name"] else "trade"
            slot = f"{k}:{tag}"
            if st["ads"].get(slot):
                continue
            ad = api(f"{ACT}/ads", "POST", name=f"{spec['name']} · {tag}",
                     adset_id=s["id"], creative=json.dumps({"creative_id": cid}),
                     status="PAUSED")
            if not ad.get("id"):
                die(f"ad failed {slot}", ad)
            st["ads"][slot] = ad["id"]
            save(st)
            print(f"    ad {ad['id']}  {spec['name']} · {tag}")

    # The older creatives stay PAUSED so the new ones are not competing with them
    # inside the same ad set for the same budget.
    for a in api(f"{CAMPAIGN}/ads", fields="name,status", limit=50).get("data", []):
        if a["id"] in st["ads"].values():
            continue
        if a["status"] != "PAUSED":
            api(a["id"], "POST", status="PAUSED")
            print(f"  paused older ad {a['id']} {a['name'][:40]}")
    print("\n  Built. Everything is PAUSED — nothing is spending.")
    show()


def activate():
    st = load()
    if not st.get("ads"):
        die("nothing built yet — run `build`")
    for slot, oid in st["ads"].items():
        if slot.endswith(":creative"):
            continue
        r = api(oid, "POST", status="ACTIVE")
        print(f"  ad      {oid} {'ok' if (r.get('success') or r.get('id')) else r}")
    for s in adsets():
        r = api(s["id"], "POST", status="ACTIVE")
        print(f"  adset   {s['id']} {'ok' if (r.get('success') or r.get('id')) else r}")
    r = api(CAMPAIGN, "POST", status="ACTIVE")
    print(f"  campaign {CAMPAIGN} {'ok' if (r.get('success') or r.get('id')) else r}")
    show()


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "show"
    {"show": show, "build": build, "activate": activate}.get(mode, show)()

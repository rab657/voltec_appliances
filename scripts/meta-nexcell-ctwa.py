#!/usr/bin/env python3
"""PREPARE (paused) a Click-to-WhatsApp campaign for the Nexcell 5.12kWh lithium battery.

Context (2026-07-31): user has ~6 units in stock and wants to move them, off the back of the
Product Talks teardown reel https://fb.watch/IIrC0w17_b/ (video 2904973823195593, 9m55s).

⚠️ WHY THIS IS *NOT* A POST BOOST: standing rule (user, 2026-07-31) is that every paid
placement must be click-to-WhatsApp. The reel's description carries a plain-text number
(0324-4004778) with no tappable CTA — the exact failure mode that made the EVE BOOST
campaign's 59 "conversations" unreachable. So this is a proper CTWA ad.

⚠️ AUDIENCE LOGIC IS DELIBERATELY INVERTED vs meta-assembler-rebuild.py. There we stripped
"Hobbies and activities" solar/battery interests because we were selling RAW CELLS and hobby
interests delivered DIY time-wasters. Here we are selling a FINISHED 5.12kWh pack to an end
customer or installer — a homeowner researching solar storage IS the buyer, so the hobby-topic
solar interests are correct and there is NO business-owner gate (that would exclude homeowners).

Usage:
  python3 scripts/meta-nexcell-ctwa.py estimate   # read-only reach check
  python3 scripts/meta-nexcell-ctwa.py build      # create campaign+adset+creative+ad, PAUSED
  python3 scripts/meta-nexcell-ctwa.py activate <campaign_id> <adset_id> <ad_id>
"""
import json, os, pathlib, subprocess, hmac, hashlib, sys

for line in pathlib.Path(__file__).resolve().parent.parent.joinpath(".env.local").read_text().splitlines():
    line = line.strip()
    if line and "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
T = os.environ["META_ADS_TOKEN"]; SEC = os.environ["META_APP_SECRET"]
V = os.environ.get("META_GRAPH_VERSION", "v21.0")
PROOF = hmac.new(SEC.encode(), T.encode(), hashlib.sha256).hexdigest()

ACT = "act_643241794546739"
PAGE = "1879349048754625"
REEL_VIDEO = "2904973823195593"      # source of the still; file itself not API-retrievable
BUDGET = "1500"                       # AED 15.00/day — user approved +10-15 on top of the 25
                                      # already running on EVE cells. Total account = AED 40/day.

# Lahore only, 40km. High-ticket + heavy + showroom-anchored (Abid Market) + only 6 units, so
# tight geo beats reach: cheaper CPM, serious local buyers. Widen if it underdelivers.
GEO = {"cities": [{"key": "1807162", "radius": 40, "distance_unit": "kilometer"}],
       "location_types": ["home", "recent"]}

# Solar-system OWNERS and installers. OR-block, no AND gate. See header for why hobby topics
# are intentionally kept here.
INTERESTS = [
    ("6003348739581", "Solar inverter"),
    ("6003180348302", "Photovoltaic system"),
    ("1494095420837262", "Rooftop photovoltaic power station"),
    ("6003359513787", "Solar panel"),
    ("6003437140731", "Solar energy"),
    ("6003254673882", "Renewable energy"),
    ("6004114545224", "Solar power"),
]

TARGETING = {
    "geo_locations": GEO,
    "age_min": 30, "age_max": 58,        # high-ticket homeowner / installer
    "flexible_spec": [{"interests": [{"id": i, "name": n} for i, n in INTERESTS]}],
    "targeting_automation": {"advantage_audience": 0},
    "publisher_platforms": ["facebook", "instagram"],
    "facebook_positions": ["feed", "facebook_reels", "story"],
    "instagram_positions": ["stream", "story", "reels"],
}

# ---- COPY ----
# RULE (user, 2026-07-27): NEVER a price in Meta ad creative — quote on WhatsApp.
# ⚠️ EVERY CLAIM BELOW IS TRACEABLE TO THE REEL'S OWN DESCRIPTION. Chemistry (LiFePO4?),
# cycle life, BMS, voltage and warranty are NOT stated anywhere we can verify, so they are
# deliberately ABSENT. Get them from the user before adding — do not invent specs.
PRIMARY = (
    "Nexcell 5.12kWh Lithium Battery — Lahore mein stock available.\n\n"
    "Solar system laga hua hai lekin raat ko backup nahi? 5.12kWh lithium pack raat bhar "
    "chalata hai — aur lead-acid ki tarah har do saal baad battery badalni nahi parti.\n\n"
    "Humne yeh pack khud khol kar check kiya — andar ka cell layout, assembly aur build "
    "quality. Poori honest review humare Product Talks par hai.\n\n"
    "✅ 5.12kWh lithium storage\n"
    "✅ Solar system ke saath\n"
    "✅ Showroom: Abid Market, Lahore — khud dekh kar khareedein\n\n"
    "Sirf 6 units stock mein. Rate aur availability ke liye message karein 👇"
)
HEADLINE = "Nexcell 5.12kWh — Lahore stock, 6 units only"


def api(path, method="GET", **params):
    a = ["curl", "-s", "--max-time", "90"] + (["-X", "POST"] if method == "POST" else ["-G"])
    a += [f"https://graph.facebook.com/{V}/{path}"]
    params.update(access_token=T, appsecret_proof=PROOF)
    for k, v in params.items():
        a += ["--data-urlencode", f"{k}={v}"]
    out = subprocess.run(a, capture_output=True, text=True).stdout
    try: return json.loads(out or "{}")
    except Exception: return {"raw": out[:300]}


def die(m, o): raise SystemExit(f"✗ {m}: {json.dumps(o)[:400]}")


def thumb_url():
    """Best still from the reel. Meta fetches image_url server-side, so no local download."""
    th = api(f"{REEL_VIDEO}/thumbnails", fields="uri,is_preferred,width,height")
    rows = th.get("data") or []
    if not rows: die("no thumbnails on the reel", th)
    pref = next((r for r in rows if r.get("is_preferred")), rows[0])
    print(f"  still: {pref.get('width')}x{pref.get('height')} (preferred={pref.get('is_preferred')})")
    if int(pref.get("height", 0)) < int(pref.get("width", 0)):
        print("  ⚠️  LANDSCAPE still — it will render small in feed and letterbox in stories.\n"
              "      Replace with a 4:5 (1080x1350) or 9:16 image, or a video cut, when available.")
    return pref["uri"]


def estimate():
    r = api(f"{ACT}/delivery_estimate", optimization_goal="CONVERSATIONS",
            targeting_spec=json.dumps(TARGETING))
    d = (r.get("data") or [{}])[0]
    if not d: die("estimate failed", r)
    print(f"Nexcell audience (Lahore 40km, solar owners+installers, 30-58): "
          f"MAU {d.get('estimate_mau_lower_bound',0):,} - {d.get('estimate_mau_upper_bound',0):,}")


def build():
    estimate()
    camp = api(f"{ACT}/campaigns", "POST",
               name="Voltec - Nexcell 5.12kWh CTWA (Lahore, solar owners)",
               objective="OUTCOME_ENGAGEMENT", status="PAUSED", special_ad_categories="[]",
               buying_type="AUCTION", daily_budget=BUDGET,
               bid_strategy="LOWEST_COST_WITHOUT_CAP")
    if not camp.get("id"): die("campaign failed", camp)
    cid = camp["id"]

    aset = api(f"{ACT}/adsets", "POST",
               name="Nexcell 5.12kWh · Lahore 40km · solar owners + installers",
               campaign_id=cid, status="PAUSED",
               optimization_goal="CONVERSATIONS", billing_event="IMPRESSIONS",
               destination_type="WHATSAPP",
               promoted_object=json.dumps({"page_id": PAGE}),
               targeting=json.dumps(TARGETING))
    if not aset.get("id"):
        api(cid, "POST", status="PAUSED")
        die("ad set failed (campaign left paused, delete it manually)", aset)
    sid = aset["id"]

    story = {"page_id": PAGE, "link_data": {
        "picture": thumb_url(), "message": PRIMARY, "name": HEADLINE,
        "link": "https://api.whatsapp.com/send",
        "call_to_action": {"type": "WHATSAPP_MESSAGE",
                           "value": {"app_destination": "WHATSAPP"}}}}
    cre = api(f"{ACT}/adcreatives", "POST",
              name="Nexcell 5.12kWh CTWA — teardown still, no price",
              object_story_spec=json.dumps(story))
    if not cre.get("id"): die("creative failed", cre)

    ad = api(f"{ACT}/ads", "POST", name="Nexcell 5.12kWh CTWA ad v1", adset_id=sid,
             creative=json.dumps({"creative_id": cre["id"]}), status="PAUSED")
    if not ad.get("id"): die("ad failed", ad)

    print(json.dumps({"campaign": cid, "adset": sid, "creative": cre["id"],
                      "ad": ad["id"], "budget_aed": int(BUDGET) / 100}, indent=1))
    print(f"\nPREPARED + PAUSED. Activate with:\n"
          f"  python3 scripts/meta-nexcell-ctwa.py activate {cid} {sid} {ad['id']}\n"
          f"⚠️ PAUSE THIS THE MOMENT 6 UNITS ARE COMMITTED — paying to turn buyers away is\n"
          f"   worse than not advertising. Check stock before every budget bump.")


def activate(cid, sid, aid):
    for lvl, oid in (("ad", aid), ("adset", sid), ("campaign", cid)):
        print(f"  {lvl:9}", api(oid, "POST", status="ACTIVE"))
    print("\n-- verify --")
    for lvl, oid in (("campaign", cid), ("adset", sid), ("ad", aid)):
        v = api(oid, fields="name,status,effective_status")
        print(f"  {lvl:9}{v.get('status'):<9}eff={v.get('effective_status')}")
    print("  IN_PROCESS/PENDING_REVIEW on the ad = normal Meta review.")


cmd = sys.argv[1] if len(sys.argv) > 1 else "estimate"
if cmd == "estimate": estimate()
elif cmd == "build": build()
elif cmd == "activate": activate(sys.argv[2], sys.argv[3], sys.argv[4])
else: print(__doc__)

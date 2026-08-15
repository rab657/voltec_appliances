#!/usr/bin/env python3
"""PREPARE (paused) the Gilgit-Baltistan push: 1 campaign, 2 CTWA ad sets + the
Places-sweep Custom Audience. Everything is created PAUSED (standing rule:
prepare, not publish). Context: GB market analysis 2026-08-04 (see memory.md +
https://claude.ai/code/artifact/6fb121fd-7932-4398-8b43-da0cedc3dc20).

WHY A DEDICATED GB CAMPAIGN: the live PJ+KPK+GB ad set gave GB only ~2% of
delivery (AED 1.70 of ~84 since Jul 31) — Meta routes spend to the bigger,
cheaper Punjab pool. GB only gets served with its own budget.

WHY THE CELLS AD SET HAS NO BUSINESS-OWNER GATE: in GB the v3 audience
(trade AND owner) collapses to 2.0-2.4K MAU — undeliverable. Trade interests
alone = 66-78K. Qualification happens in the copy (min 1 carton), the proven
mechanism. DO NOT "fix" this to match the Punjab v3 ad set.

WHY TWO AD SETS, NON-CBO: cells (trade audience) and Nexcell (consumer solar
audience) need separate budgets and separate read-outs; ad-set-level budgets
avoid CBO self-bidding in GB's small pool.

Usage:
  python3 scripts/meta-gb-ctwa.py estimate    # read-only reach check, both audiences
  python3 scripts/meta-gb-ctwa.py audience    # create Custom Audience + upload hashed phones
  python3 scripts/meta-gb-ctwa.py build       # campaign + 2 ad sets + 2 ads, ALL PAUSED
  python3 scripts/meta-gb-ctwa.py activate <campaign> <adset...> <ad...>   # after user OK
"""
import csv, json, os, pathlib, subprocess, hmac, hashlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
for line in (ROOT / ".env.local").read_text().splitlines():
    line = line.strip()
    if line and "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
T = os.environ["META_ADS_TOKEN"]; SEC = os.environ["META_APP_SECRET"]
V = os.environ.get("META_GRAPH_VERSION", "v21.0")
PROOF = hmac.new(SEC.encode(), T.encode(), hashlib.sha256).hexdigest()

ACT = "act_643241794546739"
PAGE = "1879349048754625"
CELLS_CREATIVE = "1740042563815035"   # proven cell video creative — copy already says
                                      # "Punjab, KPK & Gilgit-Baltistan delivery" + carton rule
REEL_VIDEO = "2904973823195593"       # Nexcell teardown reel (thumbnail source)
BUDGET = "923"                        # AED 9.23/day per ad set = the account's AED floor.
                                      # Both active = AED 18.46/day on top of current burn —
                                      # user decides at activation, nothing spends while PAUSED.
AUDIENCE_CSV = ROOT / ".data" / "prospects-gb-all.meta-audience.csv"   # 120 SHA256 phones

GB = {"regions": [{"key": "2942"}], "location_types": ["home", "recent"]}

# Trade interests only — the v3 list minus the owner AND-gate (see header).
TRADE = [
    ("6007434253032", "Wholesale and Retail (constituency)"),
    ("6004160504106", "Cash and carry (wholesale)"),
    ("6003227113338", "Hardware store"),
    ("6003326561843", "Electrical engineering"),
    ("6002919390822", "Electric power industry"),
    ("6003437140731", "Solar energy"),
    ("6003359513787", "Solar panel"),
    ("6003254673882", "Renewable energy"),
    ("6003348739581", "Solar inverter"),
]
# Consumer solar owners/installers — same OR-block as the Lahore Nexcell campaign.
CONSUMER = [
    ("6003348739581", "Solar inverter"),
    ("6003180348302", "Photovoltaic system"),
    ("1494095420837262", "Rooftop photovoltaic power station"),
    ("6003359513787", "Solar panel"),
    ("6003437140731", "Solar energy"),
    ("6003254673882", "Renewable energy"),
    ("6004114545224", "Solar power"),
]

def tgt(interests, age_min, age_max):
    return {
        "geo_locations": GB,
        "age_min": age_min, "age_max": age_max,
        "flexible_spec": [{"interests": [{"id": i, "name": n} for i, n in interests]}],
        "targeting_automation": {"advantage_audience": 0},
        "publisher_platforms": ["facebook", "instagram"],
        "facebook_positions": ["feed", "facebook_reels", "story"],
        "instagram_positions": ["stream", "story", "reels"],
    }

CELLS_TGT = tgt(TRADE, 25, 55)
NEX_TGT = tgt(CONSUMER, 30, 58)

# ---- Nexcell GB copy ----
# RULE: no price in creative (user, 2026-07-27). Claims limited to the reel's own
# description + the documented GB outage facts. ⚠️ USER MUST CONFIRM BEFORE ACTIVATION:
# (1) pack delivery to GB via cargo is actually offered; (2) Nexcell BMS low-temp
# charge cutoff (GB winters hit -20°C) — do not activate the Nexcell ad set without this.
NEX_PRIMARY = (
    "Nexcell 5.12kWh Lithium Battery — ab Gilgit-Baltistan ke liye bhi.\n\n"
    "Sardiyon mein 18-20 ghantay bijli band? Solar din mein chalta hai — raat ka backup "
    "lithium deta hai. 5.12kWh pack raat bhar ghar roshan rakhta hai, aur lead-acid ki "
    "tarah har do saal battery badalni nahi parti.\n\n"
    "Humne yeh pack khud khol kar check kiya — cell layout, assembly, build quality. "
    "Poori honest review humare Product Talks par maujood hai.\n\n"
    "✅ 5.12kWh lithium storage\n"
    "✅ Solar system ke saath perfect\n"
    "✅ Gilgit · Skardu · Hunza — cargo delivery\n\n"
    "Rate aur delivery ke liye WhatsApp karein 👇"
)
NEX_HEADLINE = "Nexcell 5.12kWh — Gilgit-Baltistan delivery"


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


def estimate():
    for label, spec in (("GB cells — trade only, 25-55", CELLS_TGT),
                        ("GB Nexcell — consumer solar, 30-58", NEX_TGT)):
        r = api(f"{ACT}/delivery_estimate", optimization_goal="CONVERSATIONS",
                targeting_spec=json.dumps(spec))
        d = (r.get("data") or [{}])[0]
        if not d: die(f"estimate failed: {label}", r)
        print(f"  {label:<38} MAU {d.get('estimate_mau_lower_bound',0):>7,} - "
              f"{d.get('estimate_mau_upper_bound',0):>7,}")


def audience():
    """Custom Audience from the Places sweep (SHA256 phones, PARTNER_PROVIDED —
    public Google listings). NO Lookalike from this seed: 120 phones is far below
    a useful LAL source; Phase-2 LALs come from page-engagers (rebuild script)."""
    if not AUDIENCE_CSV.exists():
        die("audience file missing — run maps-prospects.py + the compile step first",
            {"path": str(AUDIENCE_CSV)})
    hashes = [row[0] for row in list(csv.reader(open(AUDIENCE_CSV)))[1:] if row]
    print(f"  {len(hashes)} hashed phones from {AUDIENCE_CSV.name}")
    ca = api(f"{ACT}/customaudiences", "POST",
             name="GB trade prospects (Places sweep Aug 2026)",
             subtype="CUSTOM", customer_file_source="PARTNER_PROVIDED_ONLY",
             description="Battery/solar/electrical businesses in Gilgit-Baltistan, "
                         "Google Places sweep 2026-08-04. 120 numbers.")
    if not ca.get("id"):
        die("Custom Audience create failed (if it mentions ToS: accept the Custom "
            "Audience terms once at business.facebook.com/ads/manage/customaudiences/tos)", ca)
    up = api(f"{ca['id']}/users", "POST",
             payload=json.dumps({"schema": "PHONE_SHA256", "data": [[h] for h in hashes]}))
    if up.get("error"): die("upload failed (audience created, retry upload)", up)
    print(f"  ✓ audience {ca['id']} created, {up.get('num_received', '?')} received")
    print("  NOTE: match rate will be well under 100% — business listings include "
          "landlines and secondary SIMs. Audience becomes usable as it matches (~1-24h).")


def build():
    print("-- reach --"); estimate()
    camp = api(f"{ACT}/campaigns", "POST",
               name="Voltec - Gilgit-Baltistan CTWA (cells + Nexcell)",
               objective="OUTCOME_ENGAGEMENT", status="PAUSED",
               special_ad_categories="[]", buying_type="AUCTION")
    if not camp.get("id"): die("campaign failed", camp)
    cid = camp["id"]
    ids = {"campaign": cid}

    def adset(name, spec):
        r = api(f"{ACT}/adsets", "POST", name=name, campaign_id=cid, status="PAUSED",
                daily_budget=BUDGET, bid_strategy="LOWEST_COST_WITHOUT_CAP",
                optimization_goal="CONVERSATIONS", billing_event="IMPRESSIONS",
                destination_type="WHATSAPP",
                promoted_object=json.dumps({"page_id": PAGE}),
                targeting=json.dumps(spec))
        if not r.get("id"): die(f"ad set failed: {name} (campaign {cid} left paused)", r)
        return r["id"]

    # 1 · CELLS — reuse the proven video creative untouched (already names GB delivery).
    s1 = adset("GB Cells · trade interests 25-55 (no owner gate)", CELLS_TGT)
    ad1 = api(f"{ACT}/ads", "POST", name="GB cells CTWA v1 (proven video)",
              adset_id=s1, creative=json.dumps({"creative_id": CELLS_CREATIVE}),
              status="PAUSED")
    if not ad1.get("id"): die("cells ad failed", ad1)
    ids.update(cells_adset=s1, cells_ad=ad1["id"])

    # 2 · NEXCELL — new GB copy on the reel's still (landscape; replace when a 4:5 exists).
    th = api(f"{REEL_VIDEO}/thumbnails", fields="uri,is_preferred,width,height")
    rows = th.get("data") or []
    if not rows: die("no thumbnails on the reel", th)
    pref = next((r for r in rows if r.get("is_preferred")), rows[0])
    s2 = adset("GB Nexcell · solar interests 30-58", NEX_TGT)
    story = {"page_id": PAGE, "link_data": {
        "picture": pref["uri"], "message": NEX_PRIMARY, "name": NEX_HEADLINE,
        "link": "https://api.whatsapp.com/send",
        "call_to_action": {"type": "WHATSAPP_MESSAGE",
                           "value": {"app_destination": "WHATSAPP"}}}}
    cre = api(f"{ACT}/adcreatives", "POST",
              name="Nexcell GB CTWA — winter angle, no price",
              object_story_spec=json.dumps(story))
    if not cre.get("id"): die("Nexcell creative failed", cre)
    ad2 = api(f"{ACT}/ads", "POST", name="GB Nexcell CTWA v1", adset_id=s2,
              creative=json.dumps({"creative_id": cre["id"]}), status="PAUSED")
    if not ad2.get("id"): die("Nexcell ad failed", ad2)
    ids.update(nexcell_adset=s2, nexcell_creative=cre["id"], nexcell_ad=ad2["id"])

    print(json.dumps(ids, indent=1))
    print(f"\nPREPARED + PAUSED (AED {int(BUDGET)/100:.2f}/day per ad set when active).\n"
          f"  python3 scripts/meta-gb-ctwa.py activate {cid} {s1} {s2} {ad1['id']} {ad2['id']}\n"
          f"⚠️ Before activating the NEXCELL ad set: confirm GB cargo delivery is offered,\n"
          f"   one price (225 vs 230k), stock past ~6 units, and BMS low-temp charge cutoff.\n"
          f"   The CELLS ad set has no such blockers — it can go first.")


def activate(cid, s1, s2, a1, a2):
    for lvl, oid in (("ad", a1), ("ad", a2), ("adset", s1), ("adset", s2), ("campaign", cid)):
        print(f"  {lvl:9}", api(oid, "POST", status="ACTIVE"))
    print("\n-- verify --")
    for lvl, oid in (("campaign", cid), ("adset", s1), ("adset", s2), ("ad", a1), ("ad", a2)):
        v = api(oid, fields="name,status,effective_status")
        print(f"  {lvl:9}{str(v.get('status')):<9}eff={v.get('effective_status')}  {str(v.get('name'))[:44]}")
    print("  IN_PROCESS/PENDING_REVIEW on ads = normal Meta review.")


cmd = sys.argv[1] if len(sys.argv) > 1 else "estimate"
if cmd == "estimate": estimate()
elif cmd == "audience": audience()
elif cmd == "build": build()
elif cmd == "activate": activate(*sys.argv[2:7])
else: print(__doc__)

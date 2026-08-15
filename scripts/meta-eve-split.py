#!/usr/bin/env python3
"""Two-campaign EVE cells structure (2026-08-05): GB gets its own campaign+budget,
rest-of-Pakistan gets a trade campaign with a Custom-Audience ad set. Everything is
created PAUSED (standing rule: prepare, not publish).

WHY (performance read 2026-08-05):
- v1 hobby remains the efficiency benchmark (AED 3.77/qualified, 28% qualify) but its
  110-130K pool fatigued (freq 2.79). v2 wide bought cheap junk (0.55/convo, 9% qualify).
  v3 tight (ACTIVE) is v1's pool-size problem with better interests — 133-157K.
- Fixes here: (a) fresh precise layer = the 396-phone Places Custom Audience;
  (b) interest ad set keeps v3's trade-AND-owner gate but adds ICT+Sindh to grow the pool;
  (c) GB split out — inside a shared campaign it got 2% of delivery, ever.
- COPY = the corrected pitch (user, 2026-08-05): dealer rates on WhatsApp, same-day
  dispatch, test report with every carton, come check in Lahore. NO price in creative,
  NO real-vs-fake framing (both standing rules).

Usage:
  python3 scripts/meta-eve-split.py estimate            # read-only reach check
  python3 scripts/meta-eve-split.py build               # 2 campaigns + 3 ad sets, PAUSED
  python3 scripts/meta-eve-split.py video <file.mp4>    # upload the user's new video asset
  python3 scripts/meta-eve-split.py ads <video_id> [thumb_hash]   # create 3 ads, PAUSED
  python3 scripts/meta-eve-split.py activate <id> [...] # flip listed ids ACTIVE (ads->adsets->camps)
"""
import json, os, pathlib, subprocess, hmac, hashlib, sys

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
CA_PUNJAB = "120248832291210617"     # 396 Places-sweep trade phones (uploaded 2026-08-05)
FALLBACK_VIDEO = "1700035564383295"  # proven 4:5 cell video, until the new asset lands
FALLBACK_THUMB = "33850f9595e11a144d1d214dcee1bf60"
OLD_EVE_CAMPAIGN = "120248631006350617"  # pause this when the new pair goes live

TRADE = [("6007434253032", "Wholesale and Retail (constituency)"),
         ("6004160504106", "Cash and carry (wholesale)"),
         ("6003227113338", "Hardware store"),
         ("6003326561843", "Electrical engineering"),
         ("6002919390822", "Electric power industry"),
         ("6003437140731", "Solar energy"),
         ("6003359513787", "Solar panel"),
         ("6003254673882", "Renewable energy"),
         ("6003348739581", "Solar inverter")]
SBO = [("6002714898572", "Small business owners")]

def ii(pairs): return [{"id": i, "name": n} for i, n in pairs]

BASE = {"targeting_automation": {"advantage_audience": 0},
        "publisher_platforms": ["facebook", "instagram"],
        "facebook_positions": ["feed", "facebook_reels", "story"],
        "instagram_positions": ["stream", "story", "reels"]}

# Rest-of-PK campaign, ad set A: the Custom Audience IS the targeting gate.
TGT_CA = {**BASE, "geo_locations": {"countries": ["PK"], "location_types": ["home", "recent"]},
          "age_min": 22, "age_max": 60,
          "custom_audiences": [{"id": CA_PUNJAB}]}
# Ad set B: v3's quality gate (trade AND owner) on a bigger map (PJ+KPK+ICT+Sindh, no GB).
TGT_INT = {**BASE, "geo_locations": {"regions": [{"key": "2939"}, {"key": "2938"},
                                                 {"key": "2943"}, {"key": "2940"}],
                                     "location_types": ["home", "recent"]},
           "age_min": 25, "age_max": 55,
           "flexible_spec": [{"interests": ii(TRADE)}, {"behaviors": ii(SBO)}]}
# GB campaign: trade interests only — the owner AND-gate collapses GB to ~2.4K (undeliverable).
TGT_GB = {**BASE, "geo_locations": {"regions": [{"key": "2942"}],
                                    "location_types": ["home", "recent"]},
          "age_min": 25, "age_max": 55,
          "flexible_spec": [{"interests": ii(TRADE)}]}
# GB ad set 2 (user, 2026-08-05: "one for cells + one for nexcell directly from Voltec"):
# finished 5.12kWh pack → CONSUMER buyer, so hobby-topic solar interests are correct here
# and there is no business gate (same logic as the Lahore Nexcell campaign).
CONSUMER = [("6003348739581", "Solar inverter"),
            ("6003180348302", "Photovoltaic system"),
            ("1494095420837262", "Rooftop photovoltaic power station"),
            ("6003359513787", "Solar panel"),
            ("6003437140731", "Solar energy"),
            ("6003254673882", "Renewable energy"),
            ("6004114545224", "Solar power")]
TGT_GB_NEX = {**BASE, "geo_locations": {"regions": [{"key": "2942"}],
                                        "location_types": ["home", "recent"]},
              "age_min": 30, "age_max": 58,
              "flexible_spec": [{"interests": ii(CONSUMER)}]}
NEX_REEL = "2904973823195593"   # teardown reel — thumbnail source for the Nexcell ad

# ---- COPY (corrected pitch 2026-08-05; NO price, NO asli/naqli framing) ----
REST_PRIMARY = (
    "EVE LF100LA — Grade-A lithium cells, Lahore stock mein.\n\n"
    "Assemblers aur dealers ke liye: minimum 1 carton (8 cells). Single cell nahi milta.\n\n"
    "✅ Dealer rates — WhatsApp par\n"
    "✅ Same-day dispatch, cargo poore Pakistan mein\n"
    "✅ Har carton ke saath test report\n"
    "✅ Factory-sealed, direct import\n"
    "✅ Lahore mein khud aa kar check kar lein\n\n"
    "Rate list ke liye WhatsApp karein 👇"
)
REST_HEADLINE = "EVE LF100LA — dealer rates, carton of 8"
GB_PRIMARY = (
    "EVE LF100LA — Grade-A lithium cells, ab Gilgit-Baltistan delivery ke saath.\n\n"
    "Solar installers, battery dealers aur assemblers ke liye: minimum 1 carton (8 cells).\n\n"
    "✅ Dealer rates — WhatsApp par\n"
    "✅ Cargo delivery: Gilgit · Skardu · Hunza\n"
    "✅ Har carton ke saath test report\n"
    "✅ Factory-sealed, direct import — Lahore se\n\n"
    "GB mein dealer banna chahte hain? Message karein.\n"
    "Rate list ke liye WhatsApp karein 👇"
)
GB_HEADLINE = "EVE cells — Gilgit-Baltistan cargo delivery"
# Nexcell GB — every claim traceable to the teardown reel + documented GB outage facts.
# ⚠️ DO NOT ACTIVATE until user confirms: one price (225 vs 230k), GB cargo for a 50kg pack,
# restock past ~6 units, and BMS low-temperature charge cutoff (GB winters hit -20°C).
GB_NEX_PRIMARY = (
    "Nexcell 5.12kWh Lithium Battery — Voltec Lahore se, ab Gilgit-Baltistan delivery.\n\n"
    "Sardiyon mein 18-20 ghantay bijli band? Solar din mein chalta hai — raat ka backup "
    "lithium deta hai. 5.12kWh pack raat bhar ghar roshan rakhta hai.\n\n"
    "Humne yeh pack khud khol kar test kiya — poori honest review humare Product Talks "
    "page par maujood hai.\n\n"
    "✅ 5.12kWh lithium storage — solar ke saath perfect\n"
    "✅ Cargo delivery: Gilgit · Skardu · Hunza\n"
    "✅ Test report ke saath — direct Voltec se\n\n"
    "Rate aur delivery ke liye WhatsApp karein 👇"
)
GB_NEX_HEADLINE = "Nexcell 5.12kWh — Gilgit-Baltistan delivery"

# AED minor units/day per ad set. GOTCHA: ad set CREATE requires daily_budget > AED 10.00
# (err 1885272) even though EXISTING sets can later be edited down to the 9.23 floor
# (meta-budget.py did exactly that on Nexcell). So create at 10.50+.
BUDGETS = {"ca": "1150", "interests": "1400", "gb": "1150", "gb_nex": "1150"}
# 11.50 + 14.00 + 11.50 + 11.50 = 48.50/day when ALL active.
# (create-floor error said >11.07 for CONVERSATIONS; edit down toward 9.23 after creation
#  with meta-budget.py if the user wants lower totals.)
STATE = ROOT / ".data" / "eve-split-ids.json"


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
    for label, tgt in (("Rest · Custom Audience (396 phones)", TGT_CA),
                       ("Rest · trade AND owner, PJ+KPK+ICT+Sindh", TGT_INT),
                       ("GB · cells · trade interests only", TGT_GB),
                       ("GB · Nexcell · consumer solar 30-58", TGT_GB_NEX)):
        r = api(f"{ACT}/delivery_estimate", optimization_goal="CONVERSATIONS",
                targeting_spec=json.dumps(tgt))
        d = (r.get("data") or [{}])[0]
        if not d:
            print(f"  {label:<44} ERROR {json.dumps(r)[:150]}"); continue
        print(f"  {label:<44} MAU {d.get('estimate_mau_lower_bound',0):>9,} - "
              f"{d.get('estimate_mau_upper_bound',0):>9,}")


def adset(cid, name, tgt, budget):
    r = api(f"{ACT}/adsets", "POST", name=name, campaign_id=cid, status="PAUSED",
            daily_budget=budget, bid_strategy="LOWEST_COST_WITHOUT_CAP",
            optimization_goal="CONVERSATIONS", billing_event="IMPRESSIONS",
            destination_type="WHATSAPP", promoted_object=json.dumps({"page_id": PAGE}),
            targeting=json.dumps(tgt))
    if not r.get("id"): die(f"ad set failed: {name}", r)
    return r["id"]


def build():
    print("-- reach --"); estimate()
    ids = {}
    # v23+ gotcha: non-CBO campaign create REQUIRES is_adset_budget_sharing_enabled;
    # false = each ad set keeps its own budget strictly (deliberate — protects the CA set).
    c1 = api(f"{ACT}/campaigns", "POST",
             name="Voltec - EVE Cells · Pakistan Trade (CTWA, corrected pitch)",
             objective="OUTCOME_ENGAGEMENT", status="PAUSED",
             special_ad_categories="[]", buying_type="AUCTION",
             is_adset_budget_sharing_enabled="false")
    if not c1.get("id"): die("rest campaign failed", c1)
    ids["rest_campaign"] = c1["id"]
    ids["rest_ca_adset"] = adset(c1["id"], "Trade CA · Places sweep 396 · PK", TGT_CA, BUDGETS["ca"])
    ids["rest_int_adset"] = adset(c1["id"], "Trade interests AND owner · PJ+KPK+ICT+Sindh 25-55",
                                  TGT_INT, BUDGETS["interests"])
    c2 = api(f"{ACT}/campaigns", "POST",
             name="Voltec - EVE Cells · Gilgit-Baltistan (CTWA)",
             objective="OUTCOME_ENGAGEMENT", status="PAUSED",
             special_ad_categories="[]", buying_type="AUCTION",
             is_adset_budget_sharing_enabled="false")
    if not c2.get("id"): die("GB campaign failed", c2)
    ids["gb_campaign"] = c2["id"]
    ids["gb_adset"] = adset(c2["id"], "GB · trade interests 25-55 (no owner gate)", TGT_GB, BUDGETS["gb"])
    STATE.parent.mkdir(exist_ok=True)
    STATE.write_text(json.dumps(ids, indent=1))
    print(json.dumps(ids, indent=1))
    print(f"\nPREPARED + PAUSED. Budgets/day when active: CA {int(BUDGETS['ca'])/100:.2f} + "
          f"interests {int(BUDGETS['interests'])/100:.2f} + GB {int(BUDGETS['gb'])/100:.2f} "
          f"= AED {sum(int(b) for b in BUDGETS.values())/100:.2f} (old EVE campaign is 25.00 — pause it at flip).\n"
          f"Next: meta-eve-split.py video <file.mp4>  (or reuse {FALLBACK_VIDEO})  → ads <video_id>")


def gb_nexcell():
    """Add the Nexcell ad set to the EXISTING GB campaign (user, 2026-08-05)."""
    ids = json.loads(STATE.read_text())
    if "gb_nex_adset" in ids:
        print(f"already exists: {ids['gb_nex_adset']}"); return
    ids["gb_nex_adset"] = adset(ids["gb_campaign"],
                                "GB · Nexcell 5.12kWh · consumer solar 30-58",
                                TGT_GB_NEX, BUDGETS["gb_nex"])
    STATE.write_text(json.dumps(ids, indent=1))
    print(json.dumps({"gb_nex_adset": ids["gb_nex_adset"]}, indent=1))
    print("PAUSED. Its ad is created by the `ads` mode (uses the Nexcell reel thumbnail).\n"
          "⚠️ Activation blockers (user to clear): one price · GB cargo for a 50kg pack ·\n"
          "   restock past ~6 units · BMS low-temp charge cutoff.")


def video(path):
    p = pathlib.Path(path).expanduser()
    if not p.exists(): die("video file not found", {"path": str(p)})
    out = subprocess.run(["curl", "-s", "--max-time", "600", "-X", "POST",
                          f"https://graph-video.facebook.com/{V}/{ACT}/advideos",
                          "-F", f"access_token={T}", "-F", f"appsecret_proof={PROOF}",
                          "-F", f"source=@{p}"], capture_output=True, text=True).stdout
    r = json.loads(out or "{}")
    if not r.get("id"): die("video upload failed", r)
    print(f"video_id: {r['id']}  — wait for processing, then: GET /{r['id']}/thumbnails for a hash,\n"
          f"or run: meta-eve-split.py ads {r['id']}")


def ads(video_id=FALLBACK_VIDEO, thumb=FALLBACK_THUMB):
    ids = json.loads(STATE.read_text())
    th = api(f"{video_id}/thumbnails", fields="uri,is_preferred").get("data") or []
    image_kw = {}
    if th:
        pref = next((x for x in th if x.get("is_preferred")), th[0])
        image_kw = {"image_url": pref["uri"]}
    else:
        image_kw = {"image_hash": thumb}   # video_data REQUIRES a thumbnail (err 1443226)
    made = {}
    for key, aset, primary, headline in (
            ("rest_ca_ad", ids["rest_ca_adset"], REST_PRIMARY, REST_HEADLINE),
            ("rest_int_ad", ids["rest_int_adset"], REST_PRIMARY, REST_HEADLINE),
            ("gb_ad", ids["gb_adset"], GB_PRIMARY, GB_HEADLINE)):
        story = {"page_id": PAGE, "video_data": {
            "video_id": video_id, "message": primary, "title": headline, **image_kw,
            "call_to_action": {"type": "WHATSAPP_MESSAGE",
                               "value": {"app_destination": "WHATSAPP"}}}}
        cre = api(f"{ACT}/adcreatives", "POST", name=f"EVE split · {key}",
                  object_story_spec=json.dumps(story))
        if not cre.get("id"): die(f"creative failed: {key}", cre)
        ad = api(f"{ACT}/ads", "POST", name=f"EVE split · {key}", adset_id=aset,
                 creative=json.dumps({"creative_id": cre["id"]}), status="PAUSED")
        if not ad.get("id"): die(f"ad failed: {key}", ad)
        made[key] = ad["id"]
    # Nexcell GB ad — image ad off the teardown reel's preferred still (video not
    # API-retrievable; same compromise as the Lahore Nexcell campaign).
    if "gb_nex_adset" in ids and "gb_nex_ad" not in ids:
        nth = api(f"{NEX_REEL}/thumbnails", fields="uri,is_preferred").get("data") or []
        if not nth: die("no thumbnails on the Nexcell reel", nth)
        npref = next((x for x in nth if x.get("is_preferred")), nth[0])
        nstory = {"page_id": PAGE, "link_data": {
            "picture": npref["uri"], "message": GB_NEX_PRIMARY, "name": GB_NEX_HEADLINE,
            "link": "https://api.whatsapp.com/send",
            "call_to_action": {"type": "WHATSAPP_MESSAGE",
                               "value": {"app_destination": "WHATSAPP"}}}}
        ncre = api(f"{ACT}/adcreatives", "POST", name="EVE split · gb_nex_ad",
                   object_story_spec=json.dumps(nstory))
        if not ncre.get("id"): die("Nexcell GB creative failed", ncre)
        nad = api(f"{ACT}/ads", "POST", name="EVE split · gb_nex_ad",
                  adset_id=ids["gb_nex_adset"],
                  creative=json.dumps({"creative_id": ncre["id"]}), status="PAUSED")
        if not nad.get("id"): die("Nexcell GB ad failed", nad)
        made["gb_nex_ad"] = nad["id"]
    ids.update(made); STATE.write_text(json.dumps(ids, indent=1))
    print(json.dumps(made, indent=1))
    print("\nAds created PAUSED. Activate (ads→adsets→campaigns) with:\n"
          f"  meta-eve-split.py activate {' '.join(made.values())} "
          f"{ids['rest_ca_adset']} {ids['rest_int_adset']} {ids['gb_adset']} "
          f"{ids['rest_campaign']} {ids['gb_campaign']}\n"
          f"⚠️ Then PAUSE the old EVE campaign {OLD_EVE_CAMPAIGN} or budgets double up.")


def activate(*oids):
    for oid in oids:
        print(f"  {oid}", api(oid, "POST", status="ACTIVE"))
    print("\n-- verify --")
    for oid in oids:
        v = api(oid, fields="name,status,effective_status")
        print(f"  {str(v.get('status')):<9} eff={str(v.get('effective_status')):<16} {str(v.get('name'))[:48]}")
    print(f"⚠️ Reminder: pause old EVE campaign {OLD_EVE_CAMPAIGN} + verify account burn.")


cmd = sys.argv[1] if len(sys.argv) > 1 else "estimate"
if cmd == "estimate": estimate()
elif cmd == "build": build()
elif cmd == "gb-nexcell": gb_nexcell()
elif cmd == "video": video(sys.argv[2])
elif cmd == "ads": ads(*sys.argv[2:4]) if len(sys.argv) > 2 else ads()
elif cmd == "activate": activate(*sys.argv[2:])
else: print(__doc__)

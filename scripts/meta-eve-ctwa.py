#!/usr/bin/env python3
"""PREPARE (paused) a Meta Click-to-WhatsApp campaign for EVE LF100LA cells.
Target: Punjab + KPK (NOT Sindh), small-scale battery assemblers.
Self-discovers geo/interest IDs. Creates everything PAUSED. Run when
graph.facebook.com is reachable (DNS was failing 2026-07-25).

Usage:
  python3 scripts/meta-eve-ctwa.py check    # verify connectivity + Page WhatsApp + look up IDs
  python3 scripts/meta-eve-ctwa.py build    # create the paused campaign
"""
import json, os, pathlib, subprocess, hmac, hashlib, sys, base64

for line in pathlib.Path(__file__).resolve().parent.parent.joinpath(".env.local").read_text().splitlines():
    line = line.strip()
    if line and "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
T = os.environ["META_ADS_TOKEN"]; SEC = os.environ["META_APP_SECRET"]; V = os.environ.get("META_GRAPH_VERSION", "v21.0")
PROOF = hmac.new(SEC.encode(), T.encode(), hashlib.sha256).hexdigest()
ACT = "act_643241794546739"; PAGE = "1879349048754625"
AD_IMG = "/private/tmp/claude-501/-Users-raheelahmad-Downloads-voltec-appliances/c39f0a5c-9889-43e8-ad00-b32bfb18607c/scratchpad/eve-cell-ad.jpg"

def api(path, method="GET", **params):
    a = ["curl", "-s", "--max-time", "60"] + (["-X", "POST"] if method == "POST" else ["-G"])
    a += [f"https://graph.facebook.com/{V}/{path}"]
    params.update(access_token=T, appsecret_proof=PROOF)
    for k, v in params.items():
        a += ["--data-urlencode", f"{k}={v}"]
    out = subprocess.run(a, capture_output=True, text=True).stdout
    try: return json.loads(out or "{}")
    except Exception: return {"raw": out[:300]}

def region_key(q):
    r = api("search", type="adgeolocation", location_types='["region"]', q=q, country_code="PK", limit="5")
    for x in r.get("data", []):
        if x.get("country_code") == "PK":
            return x["key"], x["name"]
    return None, None

def interest_id(q):
    r = api("search", type="adinterest", q=q, limit="1")
    d = r.get("data", [])
    return (d[0]["id"], d[0]["name"]) if d else (None, None)

def behavior_id(q):
    r = api("search", type="adTargetingCategory", **{"class": "behaviors"}, q=q, limit="25")
    for x in r.get("data", []):
        if q.lower() in x.get("name", "").lower():
            return x["id"], x["name"]
    return None, None

# ---- COPY ----
# RULE (user, 2026-07-27): NEVER put a price in Facebook ad copy. Drive the inquiry to WhatsApp
# and quote there. Do not reintroduce "Rs 10,500" or any figure here.
PRIMARY = ("Battery assemblers & dealers — build your own packs with genuine Grade-A EVE LF100LA "
           "cells. 3.2V 100Ah, 5000+ cycles, QR-traceable with full test report. In stock now, "
           "delivery across Punjab & KPK. Message us for bulk & dealer rates — add your margin "
           "and sell retail.")
HEADLINE = "Genuine EVE LF100LA Cells — In Stock"
WELCOME = ("Assalam o Alaikum Voltec! I assemble batteries and want genuine EVE LF100LA cells. "
           "Please share your bulk/dealer rate, minimum order and current stock.")

def check():
    print("me:", api("me", fields="id,name"))
    print("Page WA:", api(PAGE, fields="name,connected_whatsapp_business_account,whatsapp_number"))
    for q in ["Punjab", "Khyber Pakhtunkhwa"]:
        print("geo", q, "->", region_key(q))
    for q in ["Lithium battery", "Solar energy", "Inverter (electrical generator)", "Deep cycle battery"]:
        print("interest", q, "->", interest_id(q))
    print("behavior Small business owners ->", behavior_id("Small business owners"))

def build():
    # 1) geo — hardcoded (confirmed 2026-07-25; FB search DNS was flaky)
    pj = ("2939", "Punjab"); kp = ("2938", "Khyber Pakhtunkhwa")
    regions = [{"key": pj[0]}, {"key": kp[0]}]
    # 2) audience: interests (any) AND small-business-owner behavior.
    #    Solar energy + Small business owners confirmed; enrich best-effort.
    interests = [{"id": "6003437140731", "name": "Solar energy"}]
    for q in ["Solar power", "Renewable energy", "Battery (electricity)", "Electric battery", "Inverter (electrical)"]:
        try:
            i = interest_id(q)
            if i[0] and not any(x["id"] == i[0] for x in interests):
                interests.append({"id": i[0], "name": i[1]})
        except Exception:
            pass
    beh = ("6002714898572", "Small business owners")
    flex = [{"interests": interests}, {"behaviors": [{"id": beh[0], "name": beh[1]}]}]
    targeting = {
        "geo_locations": {"regions": [{"key": r["key"]} for r in regions], "location_types": ["home", "recent"]},
        "age_min": 22, "age_max": 55,
        "flexible_spec": flex,
        "targeting_automation": {"advantage_audience": 0},
        "publisher_platforms": ["facebook", "instagram"],
        "facebook_positions": ["feed", "facebook_reels", "story"],
        "instagram_positions": ["stream", "story", "reels"],
    }
    # 3) upload ad image
    with open(AD_IMG, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode()
    up = api(f"{ACT}/adimages", method="POST", bytes=img_b64)
    img_hash = list(up.get("images", {}).values())[0]["hash"] if up.get("images") else None
    if not img_hash: raise SystemExit(f"image upload failed: {up}")
    # 4) campaign (PAUSED, CBO)
    # NOTE: ad account currency is **AED** (not PKR). daily_budget is in minor units,
    # so 3000 = AED 30.00/day (~Rs 2,350). Meta AED minimums: high-freq 923 (AED 9.23),
    # low-freq 7378 (AED 73.78). Adjust before going ACTIVE.
    camp = api(f"{ACT}/campaigns", method="POST", name="Voltec - EVE Cells CTWA (Punjab+KPK, assemblers)",
               objective="OUTCOME_ENGAGEMENT", status="PAUSED", special_ad_categories="[]",
               buying_type="AUCTION", daily_budget="3000", bid_strategy="LOWEST_COST_WITHOUT_CAP",
               is_skadnetwork_attribution_enabled="false")
    cid = camp.get("id")
    if not cid: raise SystemExit(f"campaign failed: {camp}")
    # 5) ad set — CONVERSATIONS to WhatsApp
    aset = api(f"{ACT}/adsets", method="POST", name="EVE cells · Punjab+KPK · assemblers",
               campaign_id=cid, status="PAUSED",
               optimization_goal="CONVERSATIONS", billing_event="IMPRESSIONS",
               destination_type="WHATSAPP",
               promoted_object=json.dumps({"page_id": PAGE}),
               targeting=json.dumps(targeting))
    sid = aset.get("id")
    if not sid: raise SystemExit(f"ad set failed: {aset}")
    # 6) creative (Click-to-WhatsApp) + ad
    story = {"page_id": PAGE, "link_data": {
        "image_hash": img_hash, "message": PRIMARY, "name": HEADLINE,
        "link": f"https://api.whatsapp.com/send",
        "call_to_action": {"type": "WHATSAPP_MESSAGE", "value": {"app_destination": "WHATSAPP"}}}}
    # NOTE: standard_enhancements in degrees_of_freedom_spec is deprecated (subcode 3858504) — omit it.
    cre = api(f"{ACT}/adcreatives", method="POST", name="EVE cells CTWA creative",
              object_story_spec=json.dumps(story))
    crid = cre.get("id")
    if not crid: raise SystemExit(f"creative failed: {cre}")
    ad = api(f"{ACT}/ads", method="POST", name="EVE cells CTWA ad", adset_id=sid,
             creative=json.dumps({"creative_id": crid}), status="PAUSED")
    print(json.dumps({"campaign": cid, "adset": sid, "creative": crid, "ad": ad.get("id"),
                      "regions": [r[1] for r in (pj, kp)], "interests": [i["name"] for i in interests],
                      "behavior": beh[1]}, indent=1))
    print("\nPREPARED + PAUSED. To launch: set campaign+adset+ad status ACTIVE and set real budget.")

{"check": check, "build": build}.get(sys.argv[1] if len(sys.argv) > 1 else "check", check)()

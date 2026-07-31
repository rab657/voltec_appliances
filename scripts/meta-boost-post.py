#!/usr/bin/env python3
"""Boost an existing Voltec Page post as a proper ad, using the EVE-cells audience
(Punjab + KPK, battery assemblers) rather than Meta's crude Boost UI targeting.

Creates everything PAUSED — flip to ACTIVE in Ads Manager to spend.

  python3 scripts/meta-boost-post.py <post_id> [daily_budget_minor]

Note the ad account bills in **AED**; budget is minor units (2000 = AED 20.00/day).
"""
import json, os, pathlib, subprocess, hmac, hashlib, sys

for line in pathlib.Path(__file__).resolve().parent.parent.joinpath(".env.local").read_text().splitlines():
    line = line.strip()
    if line and "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
T = os.environ["META_ADS_TOKEN"]; SEC = os.environ["META_APP_SECRET"]; V = os.environ.get("META_GRAPH_VERSION", "v21.0")
PROOF = hmac.new(SEC.encode(), T.encode(), hashlib.sha256).hexdigest()
ACT = "act_643241794546739"; PAGE = "1879349048754625"

POST_ID = sys.argv[1] if len(sys.argv) > 1 else "1543583221115161"
BUDGET = sys.argv[2] if len(sys.argv) > 2 else "2000"      # AED 20.00/day
STORY_ID = f"{PAGE}_{POST_ID}"


def api(path, method="GET", **params):
    a = ["curl", "-s", "--max-time", "60"] + (["-X", "POST"] if method == "POST" else ["-G"])
    a += [f"https://graph.facebook.com/{V}/{path}"]
    params.update(access_token=T, appsecret_proof=PROOF)
    for k, v in params.items():
        a += ["--data-urlencode", f"{k}={v}"]
    out = subprocess.run(a, capture_output=True, text=True).stdout
    try: return json.loads(out or "{}")
    except Exception: return {"raw": out[:300]}


# Same audience as the CTWA campaign: Punjab + KPK only (no Sindh),
# solar/battery interests AND small-business-owner behaviour.
TARGETING = {
    "geo_locations": {"regions": [{"key": "2939"}, {"key": "2938"}],
                      "location_types": ["home", "recent"]},
    "age_min": 22, "age_max": 55,
    "flexible_spec": [
        {"interests": [{"id": "6003437140731"}, {"id": "6004114545224"}, {"id": "6003254673882"},
                       {"id": "6003480578469"}, {"id": "6003280112623"}]},
        {"behaviors": [{"id": "6002714898572"}]},
    ],
    "targeting_automation": {"advantage_audience": 0},
    "publisher_platforms": ["facebook", "instagram"],
    "facebook_positions": ["feed", "facebook_reels", "story"],
    "instagram_positions": ["stream", "story", "reels"],
}


def main():
    camp = api(f"{ACT}/campaigns", method="POST",
               name="Voltec - EVE Cells BOOST (Punjab+KPK, assemblers)",
               objective="OUTCOME_ENGAGEMENT", status="PAUSED", special_ad_categories="[]",
               buying_type="AUCTION", daily_budget=BUDGET,
               bid_strategy="LOWEST_COST_WITHOUT_CAP")
    cid = camp.get("id")
    if not cid: raise SystemExit(f"campaign failed: {camp}")

    # Meta is fussy about which optimization_goal / destination_type / promoted_object
    # combination is legal for a boosted post. Try the valid ones in preference order.
    combos = [
        {"optimization_goal": "POST_ENGAGEMENT", "destination_type": "ON_POST",
         "promoted_object": json.dumps({"page_id": PAGE})},
        {"optimization_goal": "POST_ENGAGEMENT", "destination_type": "ON_POST"},
        {"optimization_goal": "POST_ENGAGEMENT"},
        {"optimization_goal": "REACH"},
        {"optimization_goal": "IMPRESSIONS"},
    ]
    sid, aset = None, None
    for c in combos:
        aset = api(f"{ACT}/adsets", method="POST", name="EVE cells boost · Punjab+KPK · assemblers",
                   campaign_id=cid, status="PAUSED", billing_event="IMPRESSIONS",
                   targeting=json.dumps(TARGETING), **c)
        sid = aset.get("id")
        if sid:
            print(f"ad set created with {c.get('optimization_goal')}"
                  f"{' + ' + c['destination_type'] if 'destination_type' in c else ''}")
            break
        print(f"  tried {c.get('optimization_goal')}: "
              f"{aset.get('error', {}).get('error_user_title', 'failed')}")
    if not sid:
        api(cid, "DELETE")
        raise SystemExit(f"all ad set combos failed (campaign {cid} rolled back): {aset}")

    cre = api(f"{ACT}/adcreatives", method="POST", name="EVE cells boost creative",
              object_story_id=STORY_ID)
    crid = cre.get("id")
    if not crid:
        api(cid, "DELETE")
        raise SystemExit(f"creative failed (campaign {cid} rolled back): {cre}")

    ad = api(f"{ACT}/ads", method="POST", name="EVE cells boost ad", adset_id=sid,
             creative=json.dumps({"creative_id": crid}), status="PAUSED")
    if not ad.get("id"):
        api(cid, "DELETE")
        raise SystemExit(f"ad failed (campaign {cid} rolled back): {ad}")

    print(json.dumps({"campaign": cid, "adset": sid, "creative": crid, "ad": ad["id"],
                      "boosted_post": STORY_ID, "daily_budget_AED": int(BUDGET) / 100}, indent=1))
    print("\nPREPARED + PAUSED. Flip campaign+adset+ad to ACTIVE in Ads Manager to spend.")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""PREPARE (paused) a Page-likes campaign to grow Voltec's Facebook following.

Context (2026-07-31): Page has only **551 followers** and is NOT verified. For a manufacturer
founded in 1995 selling cartons to dealers, that is a credibility problem — a dealer who checks
the Page before a bulk order sees 551 and hesitates. So followers here are a TRUST ASSET.

⚠️ THIS IS THE ONE DELIBERATE EXCEPTION to the standing rule "every paid placement must be
click-to-WhatsApp" (user, 2026-07-31). A PAGE_LIKES campaign cannot be click-to-WhatsApp by
definition. Judge it ONLY on follower growth — never on reactions, CTR or CPM, or we are back
in the BOOST vanity trap. Evidence for why that trap is real: the EVE BOOST bought 2,792 post
reactions for AED 82 and moved the follower count essentially not at all.

⚠️ DO NOT BROADEN THIS FOR CHEAPER FOLLOWS. Page likes in PK can be bought for a fraction of a
rupee, but those accounts never engage — Facebook then serves posts to a wall of dead followers,
engagement rate falls, and future ORGANIC reach drops. Buying junk followers makes the Page look
better and perform worse. Targeting is the same trade audience as the cells campaign on purpose,
so every follower is a prospect and also seeds the Page-engagers Lookalike.

⚠️ BUDGET FLOOR: AED min_daily_budget_high_freq = **923 (AED 9.23/day)**. PAGE_LIKES is a
high-frequency event, so anything below 923 is REJECTED. AED 5/day is not possible.

Usage:
  python3 scripts/meta-page-followers.py build            # create PAUSED at the AED 9.23 floor
  python3 scripts/meta-page-followers.py activate <camp> <adset> <ad>
  python3 scripts/meta-page-followers.py followers        # read current fan/follower count
"""
import json, os, pathlib, subprocess, hmac, hashlib, sys, base64

ROOT = pathlib.Path(__file__).resolve().parent.parent
for line in ROOT.joinpath(".env.local").read_text().splitlines():
    line = line.strip()
    if line and "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
T = os.environ["META_ADS_TOKEN"]; SEC = os.environ["META_APP_SECRET"]
V = os.environ.get("META_GRAPH_VERSION", "v21.0")
PROOF = hmac.new(SEC.encode(), T.encode(), hashlib.sha256).hexdigest()

ACT = "act_643241794546739"
PAGE = "1879349048754625"
BUDGET = "923"                       # AED 9.23/day = Meta's high-frequency floor for AED.
IMAGE = ROOT / "public/assets/factory-1.jpg"   # 1400x934 — "we actually manufacture" beats a
                                               # product shot for a trust/credibility ask.

# Same trade audience as meta-assembler-rebuild.py — followers who are prospects.
TRADE = [("6007434253032", "Wholesale and Retail (constituency)"),
         ("6004160504106", "Cash and carry (wholesale)"),
         ("6003227113338", "Hardware store"),
         ("6003326561843", "Electrical engineering"),
         ("6002919390822", "Electric power industry"),
         ("6003437140731", "Solar energy"),
         ("6003359513787", "Solar panel"),
         ("6003254673882", "Renewable energy"),
         ("6003348739581", "Solar inverter")]
OWNER = [("6002714898572", "Small business owners"),
         ("6020530281783", "Business page admins"),
         ("6020530250383", "Retail page admins"),
         ("6377178995383", "Shops admins"),
         ("6273196847983", "New Active Business (< 12 months)")]

TARGETING = {
    "geo_locations": {"regions": [{"key": "2939"}, {"key": "2938"}, {"key": "2942"}],
                      "location_types": ["home", "recent"]},          # Punjab, KPK, Gilgit-Baltistan
    "age_min": 25, "age_max": 55,
    "flexible_spec": [{"interests": [{"id": i, "name": n} for i, n in TRADE]},
                      {"behaviors": [{"id": i, "name": n} for i, n in OWNER]}],
    "targeting_automation": {"advantage_audience": 0},
    "publisher_platforms": ["facebook"],        # FB only — this grows the FACEBOOK Page.
    "facebook_positions": ["feed", "facebook_reels"],
}

# RULE: no price in ad creative. This one sells the company, not a product.
PRIMARY = (
    "Voltec Appliances — 1995 se Pakistan mein voltage stabilizers aur power solutions "
    "bana rahe hain.\n\n"
    "Lithium cells, stabilizers, solar storage — sab ek jagah. Naya stock, honest product "
    "reviews aur dealer offers sab se pehle dekhne ke liye page follow karein.\n\n"
    "Abid Market, Lahore · Dealers & assemblers welcome"
)
HEADLINE = "Voltec Appliances — trusted since 1995"


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


def followers():
    p = api(PAGE, fields="name,fan_count,followers_count,verification_status")
    print(f"{p.get('name')}: fans {p.get('fan_count')} · followers {p.get('followers_count')} "
          f"· verified={p.get('verification_status')}")


def build(reuse_camp=None):
    followers()
    est = api(f"{ACT}/delivery_estimate", optimization_goal="PAGE_LIKES",
              targeting_spec=json.dumps(TARGETING))
    d = (est.get("data") or [{}])[0]
    print(f"audience MAU {d.get('estimate_mau_lower_bound',0):,} - "
          f"{d.get('estimate_mau_upper_bound',0):,}")

    up = api(f"{ACT}/adimages", "POST", bytes=base64.b64encode(IMAGE.read_bytes()).decode())
    imgs = up.get("images") or {}
    if not imgs: die("image upload failed", up)
    img_hash = list(imgs.values())[0]["hash"]
    print(f"  image {IMAGE.name} -> {img_hash}")

    if reuse_camp:
        cid = reuse_camp
        c = api(cid, fields="name,status,daily_budget,objective")
        if not c.get("id"): die("campaign not found", c)
        print(f"  reusing campaign {cid} ({c.get('objective')}, "
              f"AED {int(c.get('daily_budget') or 0)/100:.2f}/day)")
    else:
        camp = api(f"{ACT}/campaigns", "POST",
                   name="Voltec - Page Followers (trade audience, PJ+KPK+GB)",
                   objective="OUTCOME_ENGAGEMENT", status="PAUSED", special_ad_categories="[]",
                   buying_type="AUCTION", daily_budget=BUDGET,
                   bid_strategy="LOWEST_COST_WITHOUT_CAP")
        if not camp.get("id"): die("campaign failed", camp)
        cid = camp["id"]

    # PAGE_LIKES needs ALL THREE or it fails:
    #   destination_type=ON_PAGE          (without it: err 2490408 "Performance goal isn't available")
    #   promoted_object={page_id}
    #   targeting.targeting_automation.advantage_audience explicitly set
    #     (omitted -> "Advantage Audience Flag Required"; set to 1 -> rejected, Advantage+
    #      audience caps the age range and ours is 25-55, so it MUST be 0)
    aset = api(f"{ACT}/adsets", "POST",
               name="Page followers · assemblers+solar trade · PJ+KPK+GB",
               campaign_id=cid, status="PAUSED",
               optimization_goal="PAGE_LIKES", billing_event="IMPRESSIONS",
               destination_type="ON_PAGE",
               promoted_object=json.dumps({"page_id": PAGE}),
               targeting=json.dumps(TARGETING))
    if not aset.get("id"):
        die(f"ad set failed (campaign {cid} left PAUSED — delete it if abandoning)", aset)
    sid = aset["id"]

    story = {"page_id": PAGE, "link_data": {
        "image_hash": img_hash, "message": PRIMARY, "name": HEADLINE,
        "link": f"https://www.facebook.com/{PAGE}",
        "call_to_action": {"type": "LIKE_PAGE", "value": {"page": PAGE}}}}
    cre = api(f"{ACT}/adcreatives", "POST", name="Page followers — factory/trust, no price",
              object_story_spec=json.dumps(story))
    if not cre.get("id"): die("creative failed", cre)

    ad = api(f"{ACT}/ads", "POST", name="Page followers ad v1", adset_id=sid,
             creative=json.dumps({"creative_id": cre["id"]}), status="PAUSED")
    if not ad.get("id"): die("ad failed", ad)

    print(json.dumps({"campaign": cid, "adset": sid, "creative": cre["id"],
                      "ad": ad["id"], "budget_aed": int(BUDGET) / 100}, indent=1))
    print(f"\nPREPARED + PAUSED. Activate with:\n"
          f"  python3 scripts/meta-page-followers.py activate {cid} {sid} {ad['id']}\n"
          f"Run this as a ~2 WEEK BURST, not forever: AED 9.23 x 14 = ~AED 129 (~Rs 10,100).\n"
          f"You do not need perpetual follower buying — you need to get off 551. Then pause and\n"
          f"let the Page-engagers Custom Audience + Lookalike do the ongoing work.")


def activate(cid, sid, aid):
    for lvl, oid in (("ad", aid), ("adset", sid), ("campaign", cid)):
        print(f"  {lvl:9}", api(oid, "POST", status="ACTIVE"))
    print("\n-- verify --")
    for lvl, oid in (("campaign", cid), ("adset", sid), ("ad", aid)):
        v = api(oid, fields="status,effective_status")
        print(f"  {lvl:9}{v.get('status'):<9}eff={v.get('effective_status')}")
    followers()


cmd = sys.argv[1] if len(sys.argv) > 1 else "followers"
if cmd == "build": build(sys.argv[2] if len(sys.argv) > 2 else None)
elif cmd == "activate": activate(sys.argv[2], sys.argv[3], sys.argv[4])
elif cmd == "followers": followers()
else: print(__doc__)

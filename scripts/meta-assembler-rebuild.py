#!/usr/bin/env python3
"""Rebuild the EVE cell audience around ASSEMBLERS + BUSINESS OWNERS (2026-07-31).

WHY (user, 2026-07-31): "we need to target business owners + lithium battery assemblers
mainly (not people looking for DIY or just 4 cells)" + lead quality bad + interest
targeting too crude.

ROOT CAUSE: every interest in the live CTWA ad set is filed by Meta under topic
**"Hobbies and activities"** — Battery (electricity), Battery charger, Electric vehicle
conversion, Solar energy/power, Renewable energy. We were literally buying hobbyists.
This script swaps that block for **"Business and industry"** trade interests and widens
the business-owner block from one behavior to five.

Everything is created PAUSED (standing rule: prepare, not publish).

Usage:
  python3 scripts/meta-assembler-rebuild.py check       # read-only: verify every ID resolves
  python3 scripts/meta-assembler-rebuild.py estimate    # read-only: reach, new vs live targeting
  python3 scripts/meta-assembler-rebuild.py pause-boost # pause the BOOST campaign (ad->adset->camp)
  python3 scripts/meta-assembler-rebuild.py budget 1500 # set CTWA daily budget (minor units, AED)
  python3 scripts/meta-assembler-rebuild.py audiences   # Custom Audiences + 1% Lookalikes
  python3 scripts/meta-assembler-rebuild.py adset       # new assembler ad set + ad (PAUSED)
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
PIXEL = "1012908876950112"
CTWA_CAMP = "120248631006350617"
CTWA_ADSET_OLD = "120248631007260617"
BOOST_CAMP = "120248636333370617"
VIDEO_ID = "1700035564383295"      # the 4:5 blurred-fill cell video (uploaded 2026-07-30)

# ---------------------------------------------------------------- targeting
# BLOCK 1 — WHAT THEY DO. Two trades the user named as critical (2026-07-31):
# **battery pack assemblers** + **solar companies**. Prefer "Business and industry" topic;
# check with GET /{interest_id}?fields=name,topic before adding anything here.
TRADE = [
    # -- trade / dealer / assembler side
    ("6007434253032", "Wholesale and Retail (constituency)"),   # Business and industry
    ("6004160504106", "Cash and carry (wholesale)"),            # Business and industry
    ("6003227113338", "Hardware store"),                        # Business and industry
    ("6003326561843", "Electrical engineering"),                # Business and industry
    ("6002919390822", "Electric power industry"),               # Hobbies-labelled but genuinely
                                                                # industry, and small (2.1M)
    # -- solar company side (user: "solar companies = critical")
    ("6003437140731", "Solar energy"),                          # Business and industry
    ("6003359513787", "Solar panel"),                           # Business and industry
    ("6003254673882", "Renewable energy"),                      # Business and industry
    ("6003348739581", "Solar inverter"),                        # Lifestyle; proven on /solar
    # DROPPED "Electrical wiring" (6003186691855): Hobbies topic, most home-DIY-prone.
    # DELIBERATELY NOT ADDED — all Hobbies topic, i.e. DIY magnets:
    #   Solar power 6004114545224 · Photovoltaics 6003775814878 ·
    #   Photovoltaic system 6003180348302 · Solar cell 6003521055570 ·
    #   Battery (electricity) 6003480578469 · Battery charger 6003280329043 ·
    #   Electric vehicle conversion 6003280112623
]
# BLOCK 2 — THAT THEY RUN A BUSINESS. Was one behavior; now five.
# "page admins" behaviors are the strongest available proxy for a real shop/dealer in PK.
OWNER = [
    ("6002714898572", "Small business owners"),
    ("6020530281783", "Business page admins"),
    ("6020530250383", "Retail page admins"),
    ("6377178995383", "Shops admins"),
    ("6273196847983", "New Active Business (< 12 months)"),
]
# Region keys verified via /search?type=adgeolocation 2026-07-31.
# GILGIT-BALTISTAN added by user instruction ("critical … they have a lot of electricity
# problems") — off-grid/weak-grid demand is exactly the solar+battery use case.
REGIONS = [
    {"key": "2939"},   # Punjab
    {"key": "2938"},   # Khyber Pakhtunkhwa
    {"key": "2942"},   # Gilgit-Baltistan
]
OPTIONAL_REGIONS = {
    "sindh":     ("2940", "Sindh"),
    "islamabad": ("2943", "Islamabad Capital Territory"),  # ⚠️ NOT covered by Punjab —
                                                          # it is its own region. Rawalpindi
                                                          # IS in Punjab, Islamabad is not.
    "ajk":       ("2941", "Azad Kashmir"),
}

# NO exclusions on purpose: the obvious DIY exclusion ("Battery (electricity)", 172-202M
# global) is so broad it would strip real assemblers too, and the pool is already
# fatigue-limited (freq 2.79 on 24k reached). Qualification is done in the COPY instead.
# Genders left unrestricted for the same reason — delivery is already 98% male by itself,
# so a hard gender lock shrinks a tight audience for a ~2% waste saving.

def targeting(extra=()):
    """extra = any of OPTIONAL_REGIONS keys, e.g. targeting(("islamabad",))"""
    regions = REGIONS + [{"key": OPTIONAL_REGIONS[k][0]} for k in extra]
    return {
        "geo_locations": {"regions": regions, "location_types": ["home", "recent"]},
        "age_min": 25, "age_max": 55,          # was 22-55; 18-24 produced 1 convo / 0 qualified
        "flexible_spec": [
            {"interests": [{"id": i, "name": n} for i, n in TRADE]},
            {"behaviors": [{"id": i, "name": n} for i, n in OWNER]},
        ],
        "targeting_automation": {"advantage_audience": 0},
        "publisher_platforms": ["facebook", "instagram"],
        "facebook_positions": ["feed", "facebook_reels", "story"],
        "instagram_positions": ["stream", "story", "reels"],
    }

# ---------------------------------------------------------------- copy
# RULE (user, 2026-07-27): NEVER a price in Meta ad creative. Quote on WhatsApp.
# User instruction 2026-07-31: "run the SAME content with our updated audience" — so this is
# the PROVEN Roman-Urdu, problem-first copy lifted verbatim from live creative
# 1360940995416527, with exactly two deltas:
#   1. the generic "Assemblers aur dealers ke liye bulk rates" line becomes a DISQUALIFIER
#      (minimum 1 carton / no single cells) — the whole point of the quality fix;
#   2. delivery line now names Gilgit-Baltistan, since GB is in the new targeting and it
#      would be incoherent to target GB while the ad says "Punjab & KPK delivery".
# To run with ZERO copy delta instead, attach existing creative 1360940995416527 to the ad.
PRIMARY = (
    "Genuine EVE LF100LA — Grade-A cells, stock mein.\n\n"
    "Jo cell aap pack ke andar daalte hain, wohi aapki pehchaan hai. Sasta cell shuru mein "
    "bachat lagta hai — lekin ek cell baith jaaye to poora bank neeche aa jaata hai, aur "
    "customer factory ko nahi, aapko call karta hai.\n\n"
    "✅ 3.2V 100Ah LiFePO4 · 5,000+ cycles\n"
    "✅ Grade-A, matched capacity\n"
    "✅ QR-traceable + full test report\n"
    "✅ Nuts + copper busbar included\n\n"
    "Sirf assemblers aur dealers ke liye — minimum 1 carton (8 cells). Single cell nahi milta.\n"
    "Punjab, KPK & Gilgit-Baltistan delivery.\n"
    "Rate ke liye message karein 👇"
)
HEADLINE = "Genuine EVE LF100LA — Grade-A, in stock"
# Thumbnail: video_data REQUIRES image_hash or image_url (err 1443226 "Your ad needs a video
# thumbnail"). Reuse the hash already attached to the live creative — same video, same frame.
THUMB_HASH = "33850f9595e11a144d1d214dcee1bf60"
# NOTE: `whatsapp_welcome_message` inside call_to_action[value] is REJECTED (err 100,
# 'Invalid keys "whatsapp_welcome_message"'). The CTWA greeting has to be set in Ads
# Manager / WhatsApp Business, not on the creative. Left as a manual step.


def api(path, method="GET", **params):
    a = ["curl", "-s", "--max-time", "60"] + (["-X", "POST"] if method == "POST" else ["-G"])
    a += [f"https://graph.facebook.com/{V}/{path}"]
    params.update(access_token=T, appsecret_proof=PROOF)
    for k, v in params.items():
        a += ["--data-urlencode", f"{k}={v}"]
    out = subprocess.run(a, capture_output=True, text=True).stdout
    try: return json.loads(out or "{}")
    except Exception: return {"raw": out[:300]}


def die(msg, obj): raise SystemExit(f"✗ {msg}: {json.dumps(obj)[:400]}")


def check():
    print("token:", api("me", fields="id,name").get("name"))
    print("\n-- BLOCK 1: trade interests (must all be 'Business and industry'-ish, not Hobbies)")
    for i, n in TRADE:
        r = api(i, fields="id,name,audience_size_lower_bound,audience_size_upper_bound,topic")
        ok = "✓" if r.get("id") else "✗"
        print(f"  {ok} {i:<18}{str(r.get('name'))[:38]:<40}topic={r.get('topic')}")
    print("\n-- BLOCK 2: business-owner behaviors")
    for i, n in OWNER:
        r = api("search", **{"type": "adTargetingCategory", "class": "behaviors", "limit": "400"})
        hit = next((x for x in r.get("data", []) if str(x.get("id")) == i), None)
        print(f"  {'✓' if hit else '✗'} {i:<18}{n[:38]:<40}"
              f"{(hit or {}).get('audience_size_lower_bound', 0):,}")
    print("\n-- geo")
    for q in ("Punjab", "Khyber Pakhtunkhwa", "Sindh"):
        r = api("search", type="adgeolocation", location_types='["region"]', q=q,
                country_code="PK", limit="3")
        for x in r.get("data", []):
            if x.get("country_code") == "PK":
                print(f"  {x['key']:<8}{x['name']}")
                break
    print(f"\n-- video {VIDEO_ID}:", api(VIDEO_ID, fields="id,status").get("status", "?"))
    print("-- live CTWA adset targeting (for comparison):")
    cur = api(CTWA_ADSET_OLD, fields="targeting").get("targeting", {})
    for blk in (cur.get("flexible_spec") or []):
        for kind, items in blk.items():
            print(f"     {kind}: {[x.get('name') for x in items]}")


def estimate():
    """Reach estimate for the proposed targeting vs the live one. Read-only."""
    def one(label, tgt, opt="CONVERSATIONS"):
        r = api(f"{ACT}/delivery_estimate", optimization_goal=opt,
                targeting_spec=json.dumps(tgt))
        d = (r.get("data") or [{}])[0]
        if not d:
            print(f"  {label:<34} ERROR {json.dumps(r)[:200]}"); return
        print(f"  {label:<34} MAU {d.get('estimate_mau_lower_bound',0):>10,} - "
              f"{d.get('estimate_mau_upper_bound',0):>10,}")
    live = api(CTWA_ADSET_OLD, fields="targeting").get("targeting", {})
    print("Deliverable audience (est. monthly active):")
    one("LIVE (hobby-contaminated, 22-55)", live)
    one("NEW assemblers+solar, PJ/KPK/GB", targeting())
    one("  + Islamabad", targeting(("islamabad",)))
    one("  + Islamabad + AJK", targeting(("islamabad", "ajk")))
    one("  + Islamabad + AJK + Sindh", targeting(("islamabad", "ajk", "sindh")))


def pause_boost():
    """Pause ad -> adset -> campaign. Order matters (memory: activation gotcha, inverted)."""
    ads = api(f"{BOOST_CAMP}/ads", fields="id,name,status")
    for a in ads.get("data", []):
        print("  ad ", a["id"], api(a["id"], "POST", status="PAUSED"))
    for s in api(f"{BOOST_CAMP}/adsets", fields="id,name,status").get("data", []):
        print("  set", s["id"], api(s["id"], "POST", status="PAUSED"))
    print("  camp", BOOST_CAMP, api(BOOST_CAMP, "POST", status="PAUSED"))
    v = api(BOOST_CAMP, fields="name,status,effective_status,daily_budget")
    print(f"\n  → {v.get('name')}: {v.get('status')} / eff {v.get('effective_status')}")
    if v.get("effective_status") != "PAUSED":
        print("  ⚠️  NOT paused — re-run and check each level (Meta silently no-ops sometimes).")


def budget(minor):
    minor = int(minor)
    if not 500 <= minor <= 50000:
        raise SystemExit(f"refusing {minor} (AED {minor/100:.2f}) — minor units, 2500 = AED 25.")
    before = api(CTWA_CAMP, fields="name,daily_budget")
    api(CTWA_CAMP, "POST", daily_budget=str(minor))
    after = api(CTWA_CAMP, fields="name,daily_budget")
    print(f"{after.get('name')}: AED {int(before.get('daily_budget') or 0)/100:.2f} → "
          f"AED {int(after.get('daily_budget') or 0)/100:.2f}/day")


def audiences():
    """Seed audiences for the 'interest targeting is too crude' fix.

    179 conversation-openers + site traffic is finally enough seed for a Lookalike,
    which beats hand-picked interests. Page-engagement + website CAs are created here;
    a WhatsApp-conversation-specific CA may only be creatable in the Ads Manager UI
    (the whatsapp_business_account event source is not reliably exposed on v21) — if
    the page CA below errors, build it in Business Suite and re-run just the lookalikes.
    """
    made = []
    eng_rule = {"inclusions": {"operator": "or", "rules": [{
        "event_sources": [{"type": "page", "id": PAGE}],
        "retention_seconds": 31536000,
        "filter": {"operator": "and", "filters": [
            {"field": "event", "operator": "eq", "value": "page_engaged"}]}}]}}
    r = api(f"{ACT}/customaudiences", "POST",
            name="Voltec — Page engagers 365d (seed)", subtype="ENGAGEMENT",
            rule=json.dumps(eng_rule))
    print("page-engagement CA:", r)
    if r.get("id"): made.append(("Page engagers", r["id"]))

    web_rule = {"inclusions": {"operator": "or", "rules": [{
        "event_sources": [{"type": "pixel", "id": PIXEL}],
        "retention_seconds": 15552000,
        "filter": {"operator": "and", "filters": [
            {"field": "url", "operator": "i_contains", "value": "voltecappliances.com"}]}}]}}
    r = api(f"{ACT}/customaudiences", "POST",
            name="Voltec — Site visitors 180d (seed)", subtype="WEBSITE",
            rule=json.dumps(web_rule))
    print("website CA:", r)
    if r.get("id"): made.append(("Site visitors", r["id"]))

    for label, oid in made:
        lal = api(f"{ACT}/customaudiences", "POST",
                  name=f"Voltec — LAL 1% PK ({label})", subtype="LOOKALIKE",
                  origin_audience_id=oid,
                  lookalike_spec=json.dumps({"type": "custom_ratio", "ratio": 0.01,
                                             "country": "PK"}))
        print(f"lookalike ({label}):", lal)
    print("\nNOTE: a Lookalike needs ~100+ matched people in PK before it populates. Check "
          "'Audiences' in Ads Manager in a few hours; if a seed is too small it stays 'Not ready'.")


def adset(reuse_adset=None):
    """New assembler-targeted ad set + ad under the existing CTWA campaign, PAUSED.

    Pass an existing ad-set id to attach a creative+ad to it instead of creating another
    (the creative call failed on the first run and left an empty ad set behind).
    """
    if reuse_adset:
        sid = reuse_adset
        cur = api(sid, fields="name,status,targeting")
        if not cur.get("id"): die("ad set not found", cur)
        geo = ((cur.get("targeting") or {}).get("geo_locations") or {}).get("regions") or []
        print(f"reusing ad set {sid} ({cur.get('status')}) — regions "
              f"{[r.get('key') for r in geo]}")
    else:
        a = api(f"{ACT}/adsets", "POST",
                name="EVE cells · PJ+KPK+GB · ASSEMBLERS+SOLAR (trade interests)",
                campaign_id=CTWA_CAMP, status="PAUSED",
                optimization_goal="CONVERSATIONS", billing_event="IMPRESSIONS",
                destination_type="WHATSAPP",
                promoted_object=json.dumps({"page_id": PAGE}),
                targeting=json.dumps(targeting()))
        if not a.get("id"): die("ad set failed", a)
        sid = a["id"]

    story = {"page_id": PAGE, "video_data": {
        "video_id": VIDEO_ID, "message": PRIMARY, "title": HEADLINE,
        "image_hash": THUMB_HASH,
        "call_to_action": {"type": "WHATSAPP_MESSAGE", "value": {
            "app_destination": "WHATSAPP", "link": "https://api.whatsapp.com/send"}}}}
    cre = api(f"{ACT}/adcreatives", "POST",
              name="EVE cells CTWA — assembler-qualified (v3, proven RU copy + carton rule)",
              object_story_spec=json.dumps(story))
    if not cre.get("id"): die("creative failed", cre)

    ad = api(f"{ACT}/ads", "POST", name="EVE cells CTWA ad — assembler v3", adset_id=sid,
             creative=json.dumps({"creative_id": cre["id"]}), status="PAUSED")
    if not ad.get("id"): die("ad failed", ad)

    est = api(f"{sid}/delivery_estimate",
              fields="estimate_mau_lower_bound,estimate_mau_upper_bound")
    print(json.dumps({"adset": sid, "creative": cre["id"], "ad": ad["id"],
                      "estimate": est.get("data")}, indent=1))
    print(f"""
PREPARED + PAUSED. To go live:
  1. python3 scripts/meta-assembler-rebuild.py budget 1500
  2. activate ad -> adset -> campaign (ad {ad['id']}, adset {sid}), then RE-VERIFY —
     one /ads call has silently returned empty before and left the ad paused.
  3. ⚠️ PAUSE the old hobby-interest ad set {CTWA_ADSET_OLD} at the same time. The
     campaign is CBO, so leaving both on makes them bid against each other.
  4. Re-read cost/QUALIFIED conversation (depth_3) after 3 full days — NOT same-day
     numbers; messaging_conversation_started_7d backfills for days and produced a
     false "broad beats narrow" verdict on 2026-07-30.""")


def activate(new_adset):
    """Swap live: activate the new assembler ad set (ad -> adset -> campaign) and pause
    the old hobby-interest ad set. CBO campaign, so both live = bidding against ourselves.
    Verifies afterwards — a bare /ads call has silently returned empty here before."""
    for a in api(f"{new_adset}/ads", fields="id,name").get("data", []):
        print("  ad ", a["id"], api(a["id"], "POST", status="ACTIVE"))
    print("  set", new_adset, api(new_adset, "POST", status="ACTIVE"))
    print("  camp", CTWA_CAMP, api(CTWA_CAMP, "POST", status="ACTIVE"))
    print("  pausing OLD hobby adset", CTWA_ADSET_OLD,
          api(CTWA_ADSET_OLD, "POST", status="PAUSED"))
    print("\n-- verify --")
    for label, oid in (("campaign", CTWA_CAMP), ("new adset", new_adset),
                       ("old adset", CTWA_ADSET_OLD)):
        v = api(oid, fields="name,status,effective_status")
        print(f"  {label:<11}{v.get('status'):<9}eff={v.get('effective_status')}")
    for a in api(f"{new_adset}/ads", fields="id,status,effective_status").get("data", []):
        print(f"  ad {a['id']}  {a.get('status')}  eff={a.get('effective_status')}")
    print("\n  IN_PROCESS on the ad = normal Meta ad review, not an error.")
    print("  If any level is not ACTIVE, re-run this command — do not assume it took.")


cmd = sys.argv[1] if len(sys.argv) > 1 else "check"
if cmd == "check": check()
elif cmd == "estimate": estimate()
elif cmd == "pause-boost": pause_boost()
elif cmd == "budget": budget(sys.argv[2])
elif cmd == "audiences": audiences()
elif cmd == "adset": adset(sys.argv[2] if len(sys.argv) > 2 else None)
elif cmd == "activate": activate(sys.argv[2])
else: print(__doc__)

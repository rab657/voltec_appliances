#!/usr/bin/env python3
"""30kVA SVC "Ultra Low Voltage" (60V) launch — AED 50/day, all click-to-WhatsApp.

Raheel, 2026-08-21: "let's boost it ... also create an ad -> 50AED per day on the
ad + boost (three variations mainly video ad boost please)".

WHY BOTH AD SETS ARE CTWA, INCLUDING THE "BOOST": the standing rule (2026-07-31)
is that EVERY paid placement must be click-to-WhatsApp. A POST_ENGAGEMENT boost
cannot carry a message button — that is exactly why BOOST's 59 "conversations"
never landed in an inbox anyone could see. So the post is promoted as an ad
inside a CONVERSATIONS / destination_type=WHATSAPP ad set instead of via the
Boost button. Engagement still accrues on the real post (social proof), but the
tap goes to WhatsApp.

AUDIENCE — phase 1 is deliberately wide (2.6-3.1M): three tight technical
interests, male only, no business-owner gate. Narrow after the first read by
flipping OWNER_AND_GATE. Verified topics only — every interest below
was checked with GET /{id}?fields=name,topic and is "Business and industry".
⚠️ REJECTED on that check, despite being in meta-gb-ctwa.py / the assembler
rebuild: Electric power industry 6002919390822, Machine tool 6002907602679 and
Textile industry 6002957337050 are all filed under **Hobbies and activities**.
(memory.md said Electric power industry was Business — Meta now says otherwise.)
Facebook only: Instagram adds ~3% reach here (555K vs 540K) and has a documented
waste record on this account (IG AED 17.17 -> 1 conversation, 0 depth-3).

Reach: 2.6-3.1M males 25-58 across 33 cities (the 8 Raheel named plus the
industrial centres and under-voltage sag belts), 07:00-24:00 viewer-local.

  python3 scripts/meta-svc60-ctwa.py estimate   # read-only reach check
  python3 scripts/meta-svc60-ctwa.py upload     # push the 3 ad videos, cache ids
  python3 scripts/meta-svc60-ctwa.py build      # campaign + 2 ad sets + 4 ads, PAUSED
  python3 scripts/meta-svc60-ctwa.py activate   # flip everything from the cache
  python3 scripts/meta-svc60-ctwa.py status     # what exists + effective_status
"""
import json, os, pathlib, subprocess, hmac, hashlib, sys, time

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
POST = "1879349048754625_1567284875411662"          # the 2026-08-21 album post
STATE = ROOT / ".data" / "svc60-campaign.json"       # gitignored
VIDEO_DIR = ROOT / "creatives" / "video"

# AED 50/day total, as instructed. Video carries the weight; the post gets a real
# slice so it actually delivers instead of being starved inside one ad set.
BUDGET_VIDEO = "3500"   # AED 35.00/day
BUDGET_POST  = "1500"   # AED 15.00/day

# The 8 Raheel named, plus the big industrial centres and the documented
# under-voltage sag belts (MEPCO / FESCO / PESCO / SEPCO) — his brief was
# "anywhere there's low voltage and 30kva requirements", not only these 8.
CITIES_NAMED = [1784775, 1800796, 1807162, 1818989, 1829523, 1811172, 1787643, 1828278]
# Faisalabad · Karachi · Lahore · Peshawar · Swabi · Mardan · Gilgit · Skardu
CITIES_EXTRA = [
    1792796, 1827865, 1814658, 1824942, 1822222, 1796082, 1795700, 1829048, 1792799,
    1827094, 1801447, 1823386, 1768090, 1821159, 1802534, 1797916, 1817231, 1778655,
    1812591, 1804508, 1820949, 1807952, 1816434, 1796324, 1833652,
]
# Gujranwala · Sialkot · Multan · Sargodha · Rawalpindi · Islamabad · Hyderabad ·
# Sukkur · Gujrat · Sheikhupura · Kasur · Sahiwal · Bahawalpur · Rahim Yar Khan ·
# Khanewal · Jhang · Nowshera · Charsadda · Mingora · Kohat · Quetta · Larkana ·
# Nawabshah · Jacobabad · Wah
CITIES = CITIES_NAMED + CITIES_EXTRA
RADIUS = 50   # km — industrial estates sit well outside the city boundary

# START WIDE, THEN NARROW (Raheel, 2026-08-21: "start a bit wide and then narrow
# down"). Sizing is binary either side of the owner AND-gate, so the middle ground
# comes from which interests are used, not from the gate:
#   3 tight technical interests, no gate ....  2.6-3.1M   <-- PHASE 1, running now
#   all 6 interests, no gate ................  9.8-11.6M  (too loose to bother with)
#   all 6 interests AND owner gate ..........  0.85-1.0M  <-- PHASE 2 target
# All verified topic == "Business and industry".
TRADE_TIGHT = [     # genuinely technical/industrial — the phase-1 audience
    ("6003698591713", "Industrial engineering"),
    ("6003071898429", "Machining"),
    ("6003326561843", "Electrical engineering"),
]
TRADE_BROAD = [     # enormous and loose; held back for reach if phase 1 starves
    ("6003374398954", "Manufacturing"),
    ("6003012400881", "Factory"),
    ("6003252179711", "Engineering"),
]
OWNER = [   # "that they actually run a business" — page-admin behaviours are the
            # best available proxy for a real shop/factory in PK. Held for phase 2.
    ("6002714898572", "Small business owners"),
    ("6020530281783", "Business page admins"),
    ("6020530250383", "Retail page admins"),
    ("6377178995383", "Shops admins"),
    ("6273196847983", "New Active Business <12mo"),
]

# --- the two knobs to turn when narrowing after the first read ---
TRADE = TRADE_TIGHT          # + TRADE_BROAD to widen
OWNER_AND_GATE = False       # True = require "runs a business" too (~0.9M)

TARGETING = {
    "geo_locations": {
        "cities": [{"key": str(k), "radius": RADIUS, "distance_unit": "kilometer"} for k in CITIES],
        "location_types": ["home", "recent"],
    },
    # Male only (Raheel, 2026-08-21: "male only. No females."). This overrides the
    # earlier "leave genders open, delivery self-selects ~98% male" note — it costs
    # ~16% of reach, which the city/interest expansion more than pays back.
    "age_min": 25, "age_max": 58, "genders": [1],
    "flexible_spec": (
        [{"interests": [{"id": i, "name": n} for i, n in TRADE]}]
        + ([{"behaviors": [{"id": i, "name": n} for i, n in OWNER]}] if OWNER_AND_GATE else [])
    ),
    "targeting_automation": {"advantage_audience": 0},
    "publisher_platforms": ["facebook"],
    "facebook_positions": ["feed", "facebook_reels", "story"],
}

# No ads 00:00-07:00 (Raheel, 2026-08-21) — 420 = 07:00, 1440 = midnight,
# viewer-local. Meta normally wants a lifetime budget for adset_schedule but
# accepts it on a daily budget here (verified on the cells v3 ad sets).
SCHEDULE = [{"days": [0, 1, 2, 3, 4, 5, 6], "start_minute": 420,
             "end_minute": 1440, "timezone_type": "USER"}]

CITIES_LINE = ("Faisalabad, Karachi, Lahore, Peshawar, Swabi, Mardan, Gilgit, Skardu — "
               "delivery poore Pakistan mein (charges alag).")

# NO PRICE in any creative (standing rule). Every variation repeats the
# single-phase disqualifier, or "30kVA" pulls three-phase industrial enquiries.
VARIATIONS = [
    {
        "key": "v1-lowvolt",
        "file": "svc60-ad-v1-lowvolt-4x5.mp4",
        "name": "SVC60 v1 · 60V hook (problem-first)",
        "headline": "60V par bhi 220V — 30kVA Single Phase",
        "desc": "100% pure copper · Voltec, 1995 se",
        "primary": (
            "Aap ki factory ka voltage 60V tak gir jata hai? ⚡\n\n"
            "Aam stabilizer 150V se neeche band ho jata hai — motor ruk jati hai, kaam ruk "
            "jata hai. Yeh video dekhein: input 60V, output 220V, load chal raha hai.\n\n"
            "✅ Input 60V se 250V tak — output 220V (±3%)\n"
            "✅ 100% pure copper winding — koi aluminium nahi\n"
            "✅ 30kVA SINGLE PHASE — yeh 3-phase unit nahi hai\n"
            "✅ Servo motor · LED meter · overload aur over-temp protection\n\n"
            f"{CITIES_LINE}\n\n"
            "Apna load aur sheher likh kar WhatsApp karein 👇"
        ),
    },
    {
        "key": "v2-range",
        "file": "svc60-ad-v2-range-4x5.mp4",
        "name": "SVC60 v2 · full-range sweep proof",
        "headline": "60V se 250V — output hamesha 220V",
        "desc": "30kVA single phase · 100% pure copper",
        "primary": (
            "Ek box — 60V se 250V tak sab sambhaal leta hai. ⚡\n\n"
            "Video mein khud dekh lein: input 98V… 170V… 215V… 260V — output har baar 220V. "
            "Din bhar voltage upar neeche hoti rahe, machine ko steady 220V milta rahe.\n\n"
            "✅ Input 60V – 250V · output 220V (±3%)\n"
            "✅ 30kVA SINGLE PHASE (3-phase nahi)\n"
            "✅ 100% pure copper · servo motor control\n"
            "✅ High/low voltage cutoff, overload, over-temperature\n\n"
            f"{CITIES_LINE}\n\n"
            "Factory, mill ya workshop ke liye. Load aur sheher likh kar WhatsApp karein 👇"
        ),
    },
    {
        "key": "v3-copper",
        "file": "svc60-ad-v3-copper-4x5.mp4",
        "name": "SVC60 v3 · pure-copper quality angle",
        "headline": "100% Pure Copper — 30kVA Single Phase",
        "desc": "60V se kaam karta hai · Voltec 1995 se",
        "primary": (
            "Andar kya hai — wohi asli farq hai. 🔍\n\n"
            "Yeh Voltec 30kVA ke andar ka video hai: 100% pure copper winding aur copper "
            "autotransformer. Aluminium nahi. Isi liye full load par garam nahi hota.\n\n"
            "✅ 100% pure copper — winding aur autotransformer\n"
            "✅ 60V se 250V input · output 220V (±3%)\n"
            "✅ 30kVA SINGLE PHASE — yeh 3-phase unit nahi hai\n"
            "✅ Servo motor · LED meter · multi-protection cutoff\n\n"
            "Sasta aluminium stabilizer baar baar jalta hai. Yeh ek dafa lagayen.\n\n"
            f"{CITIES_LINE}\n\n"
            "Rate aur delivery ke liye WhatsApp karein 👇"
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
    try: return json.loads(out or "{}")
    except Exception: return {"raw": out[:400]}


def upload_video(path: pathlib.Path, name: str):
    """/advideos needs a real multipart body, so this one can't go through api()."""
    a = ["curl", "-s", "--max-time", "600", "-X", "POST",
         f"https://graph.facebook.com/{V}/{ACT}/advideos",
         "-F", f"source=@{path}", "-F", f"name={name}",
         "-F", f"access_token={T}", "-F", f"appsecret_proof={PROOF}"]
    out = subprocess.run(a, capture_output=True, text=True).stdout
    try: return json.loads(out or "{}")
    except Exception: return {"raw": out[:400]}


def die(msg, obj=None): raise SystemExit(f"✗ {msg}" + (f": {json.dumps(obj)[:500]}" if obj else ""))


def load_state():
    return json.loads(STATE.read_text()) if STATE.exists() else {}


def save_state(s):
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(s, indent=1))


def estimate(soft=False):
    # delivery_estimate throws transient code-2 errors often enough that it must
    # never block a build — it is only a sanity read-out.
    d = {}
    for _ in range(3):
        r = api(f"{ACT}/delivery_estimate", optimization_goal="CONVERSATIONS",
                targeting_spec=json.dumps(TARGETING))
        d = (r.get("data") or [{}])[0]
        if d: break
        if not r.get("error", {}).get("is_transient"): break
        time.sleep(5)
    if not d:
        if soft:
            print("  (delivery_estimate unavailable right now — targeting unchanged, continuing)")
            return
        die("delivery_estimate failed", r)
    print(f"  {'trade AND owner' if OWNER_AND_GATE else 'trade interests'} · {len(CITIES)} cities · male · FB only · 25-58 → MAU "
          f"{d.get('estimate_mau_lower_bound',0):,} - {d.get('estimate_mau_upper_bound',0):,}")
    print(f"  budget: AED {int(BUDGET_VIDEO)/100:.2f} video + {int(BUDGET_POST)/100:.2f} post "
          f"= AED {(int(BUDGET_VIDEO)+int(BUDGET_POST))/100:.2f}/day")


def upload():
    st = load_state(); vids = st.get("videos", {})
    for v in VARIATIONS:
        if vids.get(v["key"]):
            print(f"  {v['key']}: already uploaded ({vids[v['key']]})"); continue
        p = VIDEO_DIR / v["file"]
        if not p.exists(): die(f"missing {p}")
        print(f"  uploading {v['file']} ({p.stat().st_size/1048576:.1f} MB)…")
        r = upload_video(p, v["name"])
        if not r.get("id"): die(f"upload failed for {v['key']}", r)
        vids[v["key"]] = r["id"]
        print(f"    → video {r['id']}")
    st["videos"] = vids; save_state(st)
    # Videos must finish transcoding before a creative will accept them.
    for k, vid in vids.items():
        for _ in range(40):
            s = api(vid, fields="status").get("status", {})
            phase = s.get("video_status") or s.get("processing_progress")
            if s.get("video_status") == "ready": print(f"  {k}: ready"); break
            print(f"  {k}: {phase} …"); time.sleep(15)
        else:
            print(f"  ⚠ {k}: still not ready — re-run `upload` before `build`")


def upload_image(path: pathlib.Path):
    """adimages needs a multipart body too. Returns the image_hash."""
    a = ["curl", "-s", "--max-time", "180", "-X", "POST",
         f"https://graph.facebook.com/{V}/{ACT}/adimages",
         "-F", f"filename=@{path}",
         "-F", f"access_token={T}", "-F", f"appsecret_proof={PROOF}"]
    r = json.loads(subprocess.run(a, capture_output=True, text=True).stdout or "{}")
    imgs = r.get("images") or {}
    if not imgs: die(f"adimage upload failed for {path.name}", r)
    return list(imgs.values())[0]["hash"]


def thumb_hash(v):
    """Meta's auto-picked thumbnail lands mid-clip. Every clip here is cut so that
    frame 0 IS the hook — the meter showing 60V in / 220V out — so extract frame 0
    ourselves and pin it instead of taking /{video}/thumbnails' preferred frame."""
    jpg = VIDEO_DIR / f"thumb-{v['key']}.jpg"
    if not jpg.exists():
        subprocess.run(["ffmpeg", "-v", "error", "-i", str(VIDEO_DIR / v["file"]),
                        "-frames:v", "1", "-q:v", "2", "-y", str(jpg)], check=True)
    return upload_image(jpg)


def build():
    st = load_state()
    vids = st.get("videos") or {}
    missing = [v["key"] for v in VARIATIONS if not vids.get(v["key"])]
    if missing: die(f"run `upload` first — missing videos for {missing}")
    if st.get("campaign"): die(f"campaign already built ({st['campaign']}) — use status/activate")

    print("-- reach --"); estimate(soft=True)
    # ⚠️ API gotcha (hit 2026-08-21, err 100/4834011): with ad-set budgets rather
    # than CBO you must now state is_adset_budget_sharing_enabled explicitly.
    # false = each ad set keeps its own budget, which is the point of the 35/15
    # split — sharing would let the video set siphon the post set's delivery.
    camp = api(f"{ACT}/campaigns", "POST",
               name="Voltec - SVC 30kVA 60V CTWA (video x3 + post)",
               objective="OUTCOME_ENGAGEMENT", status="PAUSED",
               special_ad_categories="[]", buying_type="AUCTION",
               is_adset_budget_sharing_enabled="false")
    if not camp.get("id"): die("campaign create failed", camp)
    cid = camp["id"]; st["campaign"] = cid; save_state(st)
    print(f"  campaign {cid}")

    def adset(name, budget):
        r = api(f"{ACT}/adsets", "POST", name=name, campaign_id=cid, status="PAUSED",
                daily_budget=budget, bid_strategy="LOWEST_COST_WITHOUT_CAP",
                optimization_goal="CONVERSATIONS", billing_event="IMPRESSIONS",
                destination_type="WHATSAPP",
                promoted_object=json.dumps({"page_id": PAGE}),
                adset_schedule=json.dumps(SCHEDULE),
                targeting=json.dumps(TARGETING))
        if not r.get("id"): die(f"ad set failed: {name} (campaign {cid} left PAUSED)", r)
        print(f"  ad set {r['id']}  {name}")
        return r["id"]

    # --- Ad set 1: the three video variations -------------------------------
    s_vid = adset(f"SVC60 video · industrial male 25-58 · {len(CITIES)} cities", BUDGET_VIDEO)
    ads = {}
    for v in VARIATIONS:
        vid = vids[v["key"]]
        story = {"page_id": PAGE, "video_data": {
            "video_id": vid,
            "image_hash": thumb_hash(v),
            "message": v["primary"],
            "title": v["headline"],
            "link_description": v["desc"],
            "call_to_action": {"type": "WHATSAPP_MESSAGE",
                               "value": {"app_destination": "WHATSAPP",
                                         "link": "https://api.whatsapp.com/send"}}}}
        cre = api(f"{ACT}/adcreatives", "POST", name=f"SVC60 {v['key']} creative",
                  object_story_spec=json.dumps(story))
        if not cre.get("id"): die(f"creative failed for {v['key']}", cre)
        ad = api(f"{ACT}/ads", "POST", name=v["name"], adset_id=s_vid,
                 creative=json.dumps({"creative_id": cre["id"]}), status="PAUSED")
        if not ad.get("id"): die(f"ad failed for {v['key']}", ad)
        ads[v["key"]] = {"ad": ad["id"], "creative": cre["id"]}
        print(f"    ad {ad['id']}  {v['name']}")

    # --- Ad set 2: the existing post, promoted with a WhatsApp button -------
    s_post = adset("SVC60 post · same audience (boost, CTWA)", BUDGET_POST)
    cre_p = api(f"{ACT}/adcreatives", "POST", name="SVC60 post boost creative",
                object_story_id=POST)
    if not cre_p.get("id"):
        print(f"  ⚠ post creative failed: {json.dumps(cre_p)[:300]}")
        st.update(adset_video=s_vid, adset_post=s_post, ads=ads); save_state(st)
        die("could not build the post creative — video ad set is fine, see state file")
    ad_p = api(f"{ACT}/ads", "POST", name="SVC60 post boost (CTWA)", adset_id=s_post,
               creative=json.dumps({"creative_id": cre_p["id"]}), status="PAUSED")
    if not ad_p.get("id"):
        print(f"  ⚠ post ad failed inside a WHATSAPP ad set: {json.dumps(ad_p)[:300]}")
        print("    → an album post may not accept a WhatsApp CTA. Options: move the "
              "AED 15 onto the video ad set, or accept a reach-only boost (which the "
              "2026-07-31 standing rule bans for lead gen).")
    else:
        ads["post"] = {"ad": ad_p["id"], "creative": cre_p["id"]}
        print(f"    ad {ad_p['id']}  SVC60 post boost (CTWA)")

    st.update(adset_video=s_vid, adset_post=s_post, ads=ads); save_state(st)
    print(f"\nPREPARED + PAUSED. Nothing is spending yet.\n  "
          f"python3 scripts/meta-svc60-ctwa.py activate")


def activate():
    st = load_state()
    if not st.get("campaign"): die("nothing built yet — run `build`")
    ids = [("ad", a["ad"]) for a in st.get("ads", {}).values()]
    ids += [("adset", st[k]) for k in ("adset_video", "adset_post") if st.get(k)]
    ids += [("campaign", st["campaign"])]
    for lvl, oid in ids:                     # ad → adset → campaign, per the gotcha
        r = api(oid, "POST", status="ACTIVE")
        print(f"  {lvl:9} {oid} {'ok' if r.get('success') or r.get('id') else r}")
    status()


def status():
    st = load_state()
    if not st.get("campaign"): print("nothing built"); return
    print("\n-- state --")
    rows = [("campaign", st["campaign"])]
    rows += [("adset", st[k]) for k in ("adset_video", "adset_post") if st.get(k)]
    rows += [(f"ad:{k}", a["ad"]) for k, a in st.get("ads", {}).items()]
    for lvl, oid in rows:
        # daily_budget is not a field on an ad — asking for it makes the whole
        # request come back empty, which reads as "everything is None".
        f = "name,status,effective_status" + ("" if lvl.startswith("ad:") else ",daily_budget")
        v = api(oid, fields=f)
        b = int(v.get("daily_budget") or 0)
        print(f"  {lvl:12} {str(v.get('status')):<8} eff={str(v.get('effective_status')):<16}"
              f"{('AED %.2f/day  ' % (b/100)) if b else '':<16}{str(v.get('name'))[:46]}")
    print("  IN_PROCESS / PENDING_REVIEW on ads = normal Meta review.")


def update():
    """Push the TARGETING + SCHEDULE above onto the already-live ad sets.

    ⚠️ Editing targeting on a live ad set restarts Meta's learning phase. Cheap
    while the ads are hours old; expensive once they have days of history.
    """
    st = load_state()
    if not st.get("campaign"): die("nothing built yet")
    print("-- new reach --"); estimate(soft=True)
    for key in ("adset_video", "adset_post"):
        sid = st[key]
        r = api(sid, "POST", targeting=json.dumps(TARGETING),
                adset_schedule=json.dumps(SCHEDULE))
        ok = bool(r.get("success") or r.get("id"))
        if not ok:
            print(f"  {key}: schedule+targeting together failed "
                  f"({r.get('error', {}).get('error_user_title', '')}) — retrying targeting only")
            r = api(sid, "POST", targeting=json.dumps(TARGETING))
            ok = bool(r.get("success") or r.get("id"))
        print(f"  {key:12} {sid} {'ok' if ok else json.dumps(r)[:200]}")
    print("\n-- verify --")
    for key in ("adset_video", "adset_post"):
        v = api(st[key], fields="name,targeting,adset_schedule,daily_budget,effective_status")
        t = v.get("targeting") or {}
        sched = v.get("adset_schedule")
        g = t.get("genders")
        print(f"  {key:12} AED {int(v.get('daily_budget') or 0)/100:>5.2f}/day  {v['effective_status']}")
        print(f"     genders={g} ({'male only' if g == [1] else 'ALL'})  age {t.get('age_min')}-{t.get('age_max')}  "
              f"cities={len((t.get('geo_locations') or {}).get('cities') or [])} @"
              f"{((t.get('geo_locations') or {}).get('cities') or [{}])[0].get('radius')}km")
        blocks = t.get("flexible_spec") or []
        print(f"     interests={len((blocks[0] or {}).get('interests') or []) if blocks else 0}  "
              f"behaviors={len((blocks[1] or {}).get('behaviors') or []) if len(blocks) > 1 else 0}")
        print(f"     hours={str(sched[0]['start_minute']//60) + ':00-' + ('24:00' if sched[0]['end_minute'] >= 1440 else str(sched[0]['end_minute']//60) + ':00') + ' viewer-local' if sched else '24h (no schedule)'}")


CONV = "onsite_conversion.messaging_conversation_started_7d"
D3 = "onsite_conversion.messaging_user_depth_3_message_send"


def readout():
    """Phase-1 → phase-2 narrowing report. Run from ~2026-08-23.

    Ranks every breakdown by **cost per depth-3** (a real chat), not by
    conversation count — conversation count alone has misled this account before.
    ⚠️ `..._7d` backfills for days, so anything under 48h old is provisional.
    """
    st = load_state()
    if not st.get("campaign"): die("nothing built yet")
    cid = st["campaign"]

    def pull(breakdowns=None, level="campaign"):
        kw = dict(date_preset="maximum", level=level,
                  fields="spend,impressions,reach,frequency,actions")
        if breakdowns: kw["breakdowns"] = breakdowns
        r = api(f"{cid}/insights", limit="80", **kw)
        if r.get("error"): return []
        out = []
        for d in r.get("data", []):
            a = {x["action_type"]: float(x["value"]) for x in d.get("actions", [])}
            label = " / ".join(str(d[k]) for k in (breakdowns or "").split(",")
                               if k and d.get(k) is not None) or d.get("campaign_name", "total")
            out.append((label, float(d.get("spend", 0)), a.get(CONV, 0), a.get(D3, 0),
                        float(d.get("frequency") or 0)))
        return out

    tot = pull()
    if not tot or tot[0][1] == 0:
        print("  no spend recorded yet — nothing to narrow on."); return
    _, sp, cv, d3, fq = tot[0]
    print(f"  TOTAL  AED {sp:.2f}  ·  {cv:.0f} conversations (AED {sp/cv:.2f})"
          f"  ·  {d3:.0f} depth-3 (AED {sp/d3:.2f})" if d3 else
          f"  TOTAL  AED {sp:.2f}  ·  {cv:.0f} conversations  ·  0 depth-3")
    print(f"  frequency {fq:.2f}" + ("  ⚠️ >3 = fatigue, refresh creative" if fq > 3 else ""))
    if d3 and cv: print(f"  qualification rate {d3/cv*100:.1f}%  (cells v2 ran 12.7%)")

    for bd, title in (("publisher_platform,platform_position", "PLACEMENT"),
                      ("age,gender", "AGE"),
                      ("region", "REGION")):
        rows = [r for r in pull(bd) if r[1] > 0]
        if not rows: continue
        print(f"\n  == {title} — ranked by AED per depth-3 ==")
        ranked = sorted(rows, key=lambda r: (r[3] == 0, r[1] / r[3] if r[3] else 9e9))
        for label, sp_, cv_, d3_, _f in ranked:
            per = f"{sp_/d3_:.2f}" if d3_ else "no depth-3"
            verdict = "KEEP" if d3_ and sp_ / d3_ <= 3 else ("watch" if d3_ else "CUT?")
            print(f"     {label[:34]:<36} AED {sp_:>7.2f}  convo {cv_:>4.0f}  d3 {d3_:>3.0f}"
                  f"  AED/d3 {per:>10}  {verdict}")

    print("\n  == ads ==")
    for a in api(f"{cid}/ads", fields="id,name", limit="20").get("data", []):
        r = api(f"{a['id']}/insights", date_preset="maximum", fields="spend,actions").get("data", [])
        if not r: continue
        acts = {x["action_type"]: float(x["value"]) for x in r[0].get("actions", [])}
        sp_ = float(r[0].get("spend", 0)); d3_ = acts.get(D3, 0); cv_ = acts.get(CONV, 0)
        print(f"     {a['name'][:40]:<42} AED {sp_:>7.2f}  convo {cv_:>4.0f}  d3 {d3_:>3.0f}"
              f"  AED/d3 {(f'{sp_/d3_:.2f}' if d3_ else '—'):>8}")

    print("\n  NARROWING (phase 1 → phase 2), in this order:")
    print("   1. Cut every placement / age / region marked CUT? above.")
    print("   2. Flip OWNER_AND_GATE = True  (2.7-3.1M → ~0.9M, requires 'runs a business').")
    print("   3. Drop the ads with no depth-3; keep the winner and refresh against it.")
    print("   Then: python3 scripts/meta-svc60-ctwa.py update")


cmd = sys.argv[1] if len(sys.argv) > 1 else "estimate"
{"estimate": estimate, "upload": upload, "build": build, "update": update,
 "activate": activate, "status": status, "readout": readout}.get(cmd, lambda: print(__doc__))()

#!/usr/bin/env python3
"""EVE cells v3 — AED 25/day, click-to-WhatsApp, PAUSED and ready for new creatives.

Raheel, 2026-08-21: "create a new campaign - I can also provide you new creatives -
get the campaign ready first with updated target audience", at AED 25/day.

WHY A NEW CAMPAIGN AND NOT A TOP-UP: v2 (`120248884775700617`) is a **lifetime**
budget campaign, fully spent (AED 209.99 of 210) and expired 2026-08-20. Meta
refuses to convert lifetime→daily ("Budget type change not allowed", err 1487164),
so a true AED 25.00/day budget can only exist on a new campaign.

WHAT v2 EARNED — the reason the structure is kept: AED 209.99 → **692 conversations
(AED 0.30 each)** and **88 depth-3 (AED 2.39 each)**, reach 38,706, frequency 1.96.
Cheaper per conversation than the July run (AED 1.15) though a lower qualification
rate (12.7% vs 26%).

WHAT CHANGED, EACH FROM v2's OWN BREAKDOWN — not from a hunch:
 1. **Facebook only.** Instagram took AED 21.15 for 6 depth-3 (AED 3.53 each) vs
    Facebook AED 188.84 for 82 (AED 2.30). IG feed was the worst line at AED 5.75
    per depth-3. facebook_reels was the best at AED 2.08.
 2. **Age 25-54** (was 22-60 on the LAL set, 25-55 on the interest set). Males
    25-54 were 96% of spend, 92% of conversations and 91% of depth-3. 55-64 gave
    1 depth-3 for AED 3.75; 18-24 was noise.
 3. **Geo trimmed to the 5 productive regions.** ⚠️ v2 carried region **2944 =
    Biala Podlaska, POLAND** — a stray key in both ad sets. It delivered ~nothing,
    but it was a live budget leak waiting to happen. Azad Kashmir (2941) spent
    AED 0.03 for zero depth-3 and is dropped too.
 4. **ABO, not CBO.** v2 was CBO, so Meta chose the split. Explicit 13.50/11.50
    here so the lookalike actually gets tested instead of being starved by the
    interest set. (Not 15/10 — see the AED 11.07 per-ad-set floor below.)
 5. **Ad set B is the LAL 1% battery-manufacturers audience**, which did not exist
    when v2 launched. ~503-592K, already "ready for use".
 6. **Male only** (Raheel, 2026-08-21). Near-free here: females were AED ~4 of v2's
    AED 210 and 3 of its 88 depth-3. Sizes after this: trade 661-777K, LAL 503-592K.
NOT widened, unlike the stabilizer campaign: "start wide then narrow" is for an
audience with no evidence behind it. This one has 692 conversations of evidence at
AED 0.30, so it stays at the size that produced them.
Kept from v2 because it worked: the trade-interest AND business-owner structure,
the DIY/sub-carton exclusion audience, CONVERSATIONS + destination_type=WHATSAPP.

DAYPARTING KEPT: 09:00-22:00 viewer-local, as v2 ran. `adset_schedule` is widely
documented as requiring a lifetime budget, but Meta **accepted it alongside a daily
budget** here (verified on both ad sets), so the budget only spends while someone
can actually reply on WhatsApp. `build` still falls back to 24h if a future API
version refuses it.

CREATIVE: seeded with v2's proven "assemblers headline" creative so the campaign is
runnable the moment it is unpaused. Swap in the new creatives with `swap` when they
land — that keeps the ad set (and its learning) and only changes the creative.

  python3 scripts/meta-cells-v3.py estimate
  python3 scripts/meta-cells-v3.py build              # PAUSED
  python3 scripts/meta-cells-v3.py swap <creative_id> [<creative_id2>]
  python3 scripts/meta-cells-v3.py activate
  python3 scripts/meta-cells-v3.py status
  python3 scripts/meta-cells-v3.py retire-v2          # pause the spent-out v2
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
V2 = "120248884775700617"
PROVEN_CREATIVE = "1068648888838164"      # v2 "assemblers headline" — placeholder
STATE = ROOT / ".data" / "cells-v3-campaign.json"

# ⚠️ Meta floor for CONVERSATIONS on this account is **AED 11.07 per ad set**
# (err 1885272 "Budget Is Too Low"). A 15/10 split is therefore illegal, so the
# proven set gets as much as it can while leaving the lookalike above the floor.
BUDGET_TRADE = "1350"   # AED 13.50/day — the proven workhorse
BUDGET_LAL   = "1150"   # AED 11.50/day — testing the new lookalike
                        # total AED 25.00/day, as instructed

REGIONS = ["2939", "2938", "2940", "2943", "2942"]   # Punjab · KPK · Sindh · Islamabad · GB
GEO = {"regions": [{"key": k} for k in REGIONS], "location_types": ["home", "recent"]}

TRADE = [   # every one verified topic == "Business and industry"
    ("6003012400881", "Factory"),
    ("6003266591109", "Electric power"),
    ("6003326561843", "Electrical engineering"),
    ("6003374398954", "Manufacturing"),
    ("6003698591713", "Industrial engineering"),
]
OWNER = [
    ("6002714898572", "Small business owners"),
    ("6020530250383", "Retail page admins"),
    ("6020530281783", "Business page admins"),
    ("6273196847983", "New Active Business (< 12 months)"),
    ("6377178995383", "Shops admins"),
]
EXCLUDE_DIY = "120248989052070617"   # "Voltec — DIY & sub-carton buyers (EXCLUDE)"
LAL_1PCT    = "120249033986980617"   # "Voltec — LAL 1% battery manufacturers (PK)"

FB_ONLY = {"publisher_platforms": ["facebook"],
           "facebook_positions": ["feed", "facebook_reels", "story"]}
# Male only (Raheel, 2026-08-21: "male only. No females."). Costs almost nothing
# here — females were AED ~4 of v2's 210 and 3 of its 88 depth-3.
BASE = {"geo_locations": GEO, "age_min": 25, "age_max": 54, "genders": [1],
        "excluded_custom_audiences": [{"id": EXCLUDE_DIY}],
        "targeting_automation": {"advantage_audience": 0}, **FB_ONLY}

TGT_TRADE = {**BASE, "flexible_spec": [
    {"interests": [{"id": i, "name": n} for i, n in TRADE]},
    {"behaviors": [{"id": i, "name": n} for i, n in OWNER]},
]}
TGT_LAL = {**BASE, "custom_audiences": [{"id": LAL_1PCT}]}

# 09:00-22:00 viewer-local, as v2 ran. Only applied if Meta accepts it alongside a
# daily budget (it normally requires a lifetime budget).
SCHEDULE = [{"days": [0, 1, 2, 3, 4, 5, 6], "start_minute": 540,
             "end_minute": 1320, "timezone_type": "USER"}]

AD_SETS = [
    ("trade", "v3 · trade AND owner · FB only · 25-54", BUDGET_TRADE, TGT_TRADE),
    ("lal",   "v3 · LAL 1% battery mfrs · FB only · 25-54", BUDGET_LAL, TGT_LAL),
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


def die(m, o=None): raise SystemExit(f"✗ {m}" + (f": {json.dumps(o)[:400]}" if o else ""))
def load(): return json.loads(STATE.read_text()) if STATE.exists() else {}
def save(s): STATE.parent.mkdir(parents=True, exist_ok=True); STATE.write_text(json.dumps(s, indent=1))


def estimate(soft=False):
    for key, label, _b, spec in AD_SETS:
        d = {}
        for _ in range(3):
            r = api(f"{ACT}/delivery_estimate", optimization_goal="CONVERSATIONS",
                    targeting_spec=json.dumps(spec))
            d = (r.get("data") or [{}])[0]
            if d or not r.get("error", {}).get("is_transient"): break
        if not d:
            print(f"  {label[:40]:42} (estimate unavailable)")
            if not soft: die("delivery_estimate failed", r)
            continue
        print(f"  {label[:40]:42} MAU {d.get('estimate_mau_lower_bound',0):>9,} - "
              f"{d.get('estimate_mau_upper_bound',0):>9,}")
    print(f"  budget AED {int(BUDGET_TRADE)/100:.2f} + {int(BUDGET_LAL)/100:.2f} = "
          f"AED {(int(BUDGET_TRADE)+int(BUDGET_LAL))/100:.2f}/day")


def build():
    st = load()
    if st.get("campaign"): die(f"already built ({st['campaign']}) — use status/swap/activate")
    print("-- reach --"); estimate(soft=True)
    camp = api(f"{ACT}/campaigns", "POST",
               name="Voltec - EVE Cells v3 CTWA (25/day, FB only, 25-54)",
               objective="OUTCOME_ENGAGEMENT", status="PAUSED",
               special_ad_categories="[]", buying_type="AUCTION",
               is_adset_budget_sharing_enabled="false")
    if not camp.get("id"): die("campaign create failed", camp)
    cid = camp["id"]; st["campaign"] = cid; save(st)
    print(f"  campaign {cid}")

    st.setdefault("adsets", {}); st.setdefault("ads", {})
    for key, name, budget, spec in AD_SETS:
        common = dict(name=name, campaign_id=cid, status="PAUSED", daily_budget=budget,
                      bid_strategy="LOWEST_COST_WITHOUT_CAP",
                      optimization_goal="CONVERSATIONS", billing_event="IMPRESSIONS",
                      destination_type="WHATSAPP",
                      promoted_object=json.dumps({"page_id": PAGE}),
                      targeting=json.dumps(spec))
        r = api(f"{ACT}/adsets", "POST", adset_schedule=json.dumps(SCHEDULE), **common)
        if not r.get("id"):
            print(f"  (dayparting rejected on a daily budget — running 24h) "
                  f"{r.get('error', {}).get('error_user_title', '')}")
            r = api(f"{ACT}/adsets", "POST", **common)
        if not r.get("id"): die(f"ad set failed: {name}", r)
        sid = r["id"]; st["adsets"][key] = sid; save(st)
        print(f"  ad set {sid}  AED {int(budget)/100:.2f}/day  {name}")

        ad = api(f"{ACT}/ads", "POST", name=f"cells v3 {key} · proven creative (placeholder)",
                 adset_id=sid, creative=json.dumps({"creative_id": PROVEN_CREATIVE}),
                 status="PAUSED")
        if not ad.get("id"): die(f"ad failed for {key}", ad)
        st["ads"][key] = ad["id"]; save(st)
        print(f"    ad {ad['id']}  (swap the creative when the new ones land)")

    print("\nPREPARED + PAUSED — nothing is spending.\n"
          "  new creatives: python3 scripts/meta-cells-v3.py swap <creative_id> [<creative_id2>]\n"
          "  go live      : python3 scripts/meta-cells-v3.py activate\n"
          "  then         : python3 scripts/meta-cells-v3.py retire-v2")


def swap(*creative_ids):
    """Point the existing ads at new creatives, keeping the ad sets and their learning."""
    st = load()
    if not st.get("ads"): die("nothing built yet")
    keys = list(AD_SETS and [k for k, *_ in AD_SETS])
    if not creative_ids: die("pass at least one creative id")
    for i, key in enumerate(keys):
        cre = creative_ids[i] if i < len(creative_ids) else creative_ids[-1]
        r = api(st["ads"][key], "POST", creative=json.dumps({"creative_id": cre}))
        print(f"  {key:6} ad {st['ads'][key]} -> creative {cre}: "
              f"{'ok' if (r.get('success') or r.get('id')) else json.dumps(r)[:200]}")
    status()


def activate():
    st = load()
    if not st.get("campaign"): die("nothing built yet — run `build`")
    order = [("ad", v) for v in st.get("ads", {}).values()]
    order += [("adset", v) for v in st.get("adsets", {}).values()]
    order += [("campaign", st["campaign"])]
    for lvl, oid in order:                    # ad -> adset -> campaign
        r = api(oid, "POST", status="ACTIVE")
        print(f"  {lvl:9} {oid} {'ok' if (r.get('success') or r.get('id')) else r}")
    status()


def retire_v2():
    """v2 is spent out and expired; pause it so it can never bid against v3."""
    for lvl, oid in (("campaign", V2),):
        print(f"  {lvl} {oid}:", api(oid, "POST", status="PAUSED"))
    v = api(V2, fields="name,effective_status")
    print(f"  now {v.get('effective_status')}  {v.get('name')}")


def status():
    st = load()
    if not st.get("campaign"): print("nothing built"); return
    print("\n-- state --")
    rows = [("campaign", st["campaign"])]
    rows += [(f"adset:{k}", v) for k, v in st.get("adsets", {}).items()]
    rows += [(f"ad:{k}", v) for k, v in st.get("ads", {}).items()]
    for lvl, oid in rows:
        f = "name,status,effective_status" + ("" if lvl.startswith("ad:") else ",daily_budget")
        v = api(oid, fields=f)
        b = int(v.get("daily_budget") or 0)
        print(f"  {lvl:14}{str(v.get('status')):<8} eff={str(v.get('effective_status')):<16}"
              f"{('AED %.2f/day  ' % (b/100)) if b else '':<16}{str(v.get('name'))[:44]}")


cmd = sys.argv[1] if len(sys.argv) > 1 else "estimate"
if cmd == "swap": swap(*sys.argv[2:])
elif cmd == "retire-v2": retire_v2()
else:
    {"estimate": estimate, "build": build, "activate": activate,
     "status": status}.get(cmd, lambda: print(__doc__))()

#!/usr/bin/env python3
"""Improve the two EVE/lithium responsive search ads in the Industrial & Tenders campaign.

WHY (2026-07-31): Google reported Ad strength AVERAGE on all five ads in campaign
24014479357's sibling 24014784850, and "Improve your responsive search ads (+3.4%)".
Both cells ad groups had only 8-9 of 15 headlines. Adding distinct, keyword-bearing
headlines is the actual lever behind that recommendation.

It ALSO fixes a factual contradiction the user asked to reconcile: ad copy said
"Direct importer" while the new blog post and site now say authorised EVE distributor.
Descriptions were already 4/4 (the maximum), so the importer line is REPLACED, not added.

⚠️ NOT TOUCHED ON PURPOSE — the "Lithium Cells & Energy Storage" ad group advertises
"280Ah / 304Ah LiFePO4" in a headline and "280Ah and 304Ah cells in volume" in a
description, but Voltec stocks only the LF100LA (100Ah). Either those are supplied to
order, or the ad is promising stock that does not exist and paying for the clicks.
Confirm with the user before editing; do not silently delete a real capability.

Google limits: headline <= 30 chars, description <= 90. Enforced below.

Usage:
  python3 scripts/google-rsa-improve.py show     # current assets + counts
  python3 scripts/google-rsa-improve.py apply    # push the new assets
"""
import json, pathlib, sys, urllib.parse, urllib.request

CFG = {}
for line in (pathlib.Path(__file__).resolve().parent.parent / ".env.local").read_text().splitlines():
    line = line.strip()
    if line and "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); CFG[k.strip()] = v.strip().strip('"').strip("'")
CID = CFG["GOOGLE_ADS_CUSTOMER_ID"]
API = "https://googleads.googleapis.com/v21"

BRAND_AD = "818037394941"      # ad group "EVE Cells (brand)"
GENERIC_AD = "816046360518"    # ad group "Lithium Cells & Energy Storage"

# Headlines to ADD (existing ones are kept). Chosen to cover the exact queries the
# business cares about — "genuine EVE cells in pakistan", "authorised distributor of
# EVE cells in pakistan" — without duplicating what is already there.
ADD_HEADLINES = {
    BRAND_AD: [
        "Authorised EVE Distributor",
        "Genuine EVE Cells Pakistan",
        "EVE LF100LA Stock in Lahore",
        "Carton of 8 - 24V or 48V",
        "Full Test Report Included",
        "Assemblers & Dealers Welcome",
    ],
    GENERIC_AD: [
        "Authorised EVE Distributor",
        "LiFePO4 Cells Lahore Stock",
        "Cells for 48V Solar Banks",
        "Dealer Rates on Cartons",
        "Verified QR, Grade-A Only",
        "For Battery Pack Assemblers",
        "Lahore, Since 1995",
    ],
}

# Descriptions are capped at 4, so the "Direct importer" line is swapped out.
REPLACE_DESCRIPTIONS = {
    BRAND_AD: {
        "Direct from EVE Energy by Voltec, Lahore since 1995. Full test report with every batch.":
        "Authorised EVE distributor. Voltec, Lahore since 1995. Test report with every batch.",
    },
    GENERIC_AD: {
        "Direct importer of Grade-A EVE LiFePO4 cells, matched & QR-traceable in Lahore.":
        "Authorised EVE distributor. Grade-A cells, matched and QR-traceable, from Lahore.",
    },
}


def token():
    body = urllib.parse.urlencode({
        "client_id": CFG["GOOGLE_ADS_CLIENT_ID"], "client_secret": CFG["GOOGLE_ADS_CLIENT_SECRET"],
        "refresh_token": CFG["GOOGLE_ADS_REFRESH_TOKEN"], "grant_type": "refresh_token"}).encode()
    return json.loads(urllib.request.urlopen(
        urllib.request.Request("https://oauth2.googleapis.com/token", data=body)).read())["access_token"]


def hdrs(t):
    return {"Authorization": f"Bearer {t}", "developer-token": CFG["GOOGLE_ADS_DEVELOPER_TOKEN"],
            "login-customer-id": CFG["GOOGLE_ADS_LOGIN_CUSTOMER_ID"], "Content-Type": "application/json"}


def call(path, payload, t):
    req = urllib.request.Request(f"{API}/customers/{CID}/{path}",
                                data=json.dumps(payload).encode(), headers=hdrs(t))
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {"ERROR": e.read().decode()[:1200]}


def fetch(t):
    q = ("SELECT ad_group.name, ad_group_ad.ad.id, ad_group_ad.ad_strength, "
         "ad_group_ad.ad.responsive_search_ad.headlines, "
         "ad_group_ad.ad.responsive_search_ad.descriptions "
         f"FROM ad_group_ad WHERE ad_group_ad.ad.id IN ({BRAND_AD}, {GENERIC_AD})")
    res = call("googleAds:search", {"query": q}, t)
    if "ERROR" in res: raise SystemExit(res["ERROR"])
    out = {}
    for r in res.get("results", []):
        ad = r["adGroupAd"]["ad"]; rsa = ad["responsiveSearchAd"]
        out[ad["id"]] = {
            "group": r["adGroup"]["name"], "strength": r["adGroupAd"].get("adStrength"),
            "headlines": [h["text"] for h in rsa.get("headlines", [])],
            "descriptions": [d["text"] for d in rsa.get("descriptions", [])],
        }
    return out


def validate():
    bad = []
    for ad, hs in ADD_HEADLINES.items():
        for h in hs:
            if len(h) > 30: bad.append(f"headline {len(h)}>30: {h}")
    for ad, m in REPLACE_DESCRIPTIONS.items():
        for new in m.values():
            if len(new) > 90: bad.append(f"description {len(new)}>90: {new}")
    if bad:
        raise SystemExit("✗ length violations:\n  " + "\n  ".join(bad))
    print("  ✓ all new assets within Google limits (headline<=30, description<=90)")


def show():
    validate()
    cur = fetch(token())
    for ad, d in cur.items():
        print(f"\n--- {d['group']}  (ad {ad})  strength={d['strength']}")
        print(f"  headlines {len(d['headlines'])}/15 -> would become "
              f"{len(d['headlines']) + len(ADD_HEADLINES.get(ad, []))}/15")
        for h in ADD_HEADLINES.get(ad, []):
            dup = " ALREADY PRESENT — will skip" if h in d["headlines"] else ""
            print(f"     + [{len(h):>2}] {h}{dup}")
        for old, new in REPLACE_DESCRIPTIONS.get(ad, {}).items():
            here = "" if old in d["descriptions"] else "  ⚠️ OLD TEXT NOT FOUND — skip"
            print(f"     ~ [{len(new):>2}] {new}{here}")


def apply():
    validate()
    t = token()
    cur = fetch(t)
    ops = []
    for ad, d in cur.items():
        heads = list(d["headlines"])
        for h in ADD_HEADLINES.get(ad, []):
            if h not in heads and len(heads) < 15:
                heads.append(h)
        descs = []
        for old in d["descriptions"]:
            descs.append(REPLACE_DESCRIPTIONS.get(ad, {}).get(old, old))
        ops.append({
            "update": {
                "resourceName": f"customers/{CID}/ads/{ad}",
                "responsiveSearchAd": {
                    "headlines": [{"text": h} for h in heads],
                    "descriptions": [{"text": x} for x in descs],
                },
            },
            "updateMask": "responsive_search_ad.headlines,responsive_search_ad.descriptions",
        })
        print(f"  {d['group']}: {len(d['headlines'])} -> {len(heads)} headlines, "
              f"{len(descs)} descriptions")

    # NOTE: the flag is `partialFailure`, not `partialFailureError` (that is the
    # response field). Sending the wrong one fails the whole call with INVALID_ARGUMENT.
    res = call("ads:mutate", {"operations": ops, "partialFailure": False}, t)
    if "ERROR" in res:
        print(f"\n✗ MUTATE FAILED:\n{res['ERROR']}")
        sys.exit(1)
    print(f"\n✓ updated {len(res.get('results', []))} ad(s)")
    after = fetch(token())
    for ad, d in after.items():
        print(f"  {d['group']}: {len(d['headlines'])} headlines, "
              f"{len(d['descriptions'])} descriptions, strength={d['strength']}")
    print("\nAd strength is recalculated by Google over a few hours — do not expect it to "
          "flip to GOOD instantly. Edited ads also re-enter review briefly.")


cmd = sys.argv[1] if len(sys.argv) > 1 else "show"
if cmd == "show": show()
elif cmd == "apply": apply()
else: print(__doc__)

#!/usr/bin/env python3
"""Reposition the Google Search RSAs on IMPORTED for the lines that are imported
(user, 2026-09-18: "play the IMPORTED card" — clarified the same day: roots are in
Pakistan, the AVR relay A-series IS made in Pakistan and keeps that tag; servo (SVC),
IGBT and SCR stabilizers and the EVE cells are all imported).

What this does: the servo / 3-phase / IGBT stabilizer ads drop "Made in Lahore Since
1995", "Voltage Stabilizer Maker" and "Built to Order" for "Imported …", "Voltage
Stabilizer Importer", "Made to Spec". The paused Showroom ad (A-series AC units + servo)
says which is which. The cells ads keep their Lahore/Pakistan keyword headlines — those
were never origin claims. Plus the "Servo Stabilizers" sitelink description.

Scope: every non-removed RSA (live and paused — paused ones get re-enabled later and
must not resurrect the old claim). Google limits: headline <= 30 chars, description
<= 90. Enforced below.

Idempotent: a replacement whose old text is no longer present is skipped; headlines
to ADD are skipped when already present or when the ad is at 15/15.

Usage:
  python3 scripts/google-rsa-imported.py show    # dry run — what would change
  python3 scripts/google-rsa-imported.py apply   # push
"""
import json, pathlib, sys, urllib.parse, urllib.request

CFG = {}
for line in (pathlib.Path(__file__).resolve().parent.parent / ".env.local").read_text().splitlines():
    line = line.strip()
    if line and "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); CFG[k.strip()] = v.strip().strip('"').strip("'")
CID = CFG["GOOGLE_ADS_CUSTOMER_ID"]
API = "https://googleads.googleapis.com/v22"

# ad id -> {old headline: new headline}. Keys include the 2026-09-18 first-pass interim
# texts so a re-run converges on the final copy (plan() only touches exact matches).
REPLACE_HEADLINES = {
    # Industrial & Tenders — Servo Motor Stabilizers (10-500 kVA): servo = imported
    "815931131422": {
        "Built to Order, On Demand": "Imported Servo Stabilizers",
        "Made in Lahore Since 1995": "Imported, Trusted Since 1995",
        "Importer Since 1995": "Imported, Trusted Since 1995",
        "Voltage Stabilizer Maker": "Voltage Stabilizer Importer",
        "Built to Order Since 1995": "Imported, Made to Your Spec",
    },
    # Industrial & Tenders — 3-Phase Industrial & Tenders: SJW 3-phase = imported, made to spec
    "815925933061": {
        "Industrial Stabilizer Maker": "Imported 3-Phase Stabilizers",
        "100-500 kVA, Built to Order": "100-500 kVA, Made to Spec",
        "Made in Lahore Since 1995": "Imported, Trusted Since 1995",
        "Importer Since 1995": "Imported, Trusted Since 1995",
        "Nationwide Supply, Pakistan": "Nationwide Supply & Service",
    },
    # Industrial & Tenders — IGBT / Static & Precision (the ad in the screenshot): IGBT = imported
    "815893460295": {
        "Voltage Stabilizer Maker": "Imported IGBT Stabilizers",
        "Made in Lahore Since 1995": "Imported, Trusted Since 1995",
        "Importer Since 1995": "Imported, Trusted Since 1995",
    },
    # Lahore Showroom (paused): sells the Pakistan-made A-series AC (AVR) units AND imported servo.
    # Keep the address; say which is which.
    "816130249393": {
        "Made in Lahore Since 1995": "Imported Servo Stabilizers",
        "Imported Stabilizers": "Imported Servo Stabilizers",
    },
    # Cells ads: the first pass swapped "Pakistan"/"Lahore" keyword headlines out. The user
    # clarified roots/market mentions are fine — restore the originals (keyword relevance).
    "818153068934": {
        "In Stock, Ships Nationwide": "In Stock, Ships Pakistan",
    },
    "818037394941": {
        "Imported Direct from EVE": "EVE Cells in Pakistan",
        "Genuine Imported EVE Cells": "Genuine EVE Cells Pakistan",
        "EVE LF100LA in Stock Now": "EVE LF100LA Stock in Lahore",
    },
    "816046360518": {
        "Lithium Cells Importer": "Lithium Cells Importer PK",
        "LiFePO4 Cells in Stock Now": "LiFePO4 Cells Lahore Stock",
        "Importer Since 1995": "Lahore, Since 1995",
    },
}

# ad id -> headlines to ADD (only where there is room; the IGBT ad had 8/15)
ADD_HEADLINES = {
    "815893460295": ["Voltage Stabilizer Importer", "Nationwide Supply & Service"],
}

# ad id -> {old description: new description}
REPLACE_DESCRIPTIONS = {
    "815931131422": {
        "Servo motor stabilizers 10 kVA to 500 kVA, built to order for shop, building or plant.":
        "Imported servo motor stabilizers 10 kVA to 500 kVA for shop, building or plant.",
        "Corporate, dealer & government tender supply across Pakistan. Since 1995.":
        "Imported stabilizers. Corporate, dealer & government tender supply nationwide. Since 1995.",
    },
    "815925933061": {
        "SJW-series 3-phase stabilizers, 100-500 kVA+, built to your load. Balanced 400V.":
        "Imported SJW-series 3-phase stabilizers, 100-500 kVA+, sized to your load. Balanced 400V.",
        "Corporate, institutional & government tender supply across Pakistan. Message us.":
        "Corporate, institutional & government tender supply nationwide. Message us.",
    },
    "815893460295": {
        "IGBT / static stabilizers for precision, medical & sensitive equipment. Made in Lahore.":
        "Imported IGBT / static stabilizers for precision, medical & sensitive equipment.",
        "Corporate, dealer & government tender supply across Pakistan. Message us.":
        "Corporate, dealer & government tender supply nationwide. Message us.",
    },
    "816130249393": {
        "AC, servo and industrial voltage stabilizers made in Lahore since 1995.":
        "Pakistan-made AC stabilizers and imported servo units. Trusted in Lahore since 1995.",
        "Imported AC, servo and industrial voltage stabilizers. Trusted since 1995.":
        "Pakistan-made AC stabilizers and imported servo units. Trusted in Lahore since 1995.",
    },
    # cells ads: restore the originals (see note above)
    "818153068934": {
        "Rs 10,000 per cell, minimum 1 carton of 8. In stock, ships nationwide.":
        "Rs 10,000 per cell, minimum 1 carton of 8. In stock, ships across Pakistan.",
    },
    "818037394941": {
        "Authorised EVE distributor. Importer since 1995. Test report with every batch.":
        "Authorised EVE distributor. Voltec, Lahore since 1995. Test report with every batch.",
        "Order on WhatsApp — nationwide delivery, bulk and dealer pricing available.":
        "Order on WhatsApp — delivery across Pakistan, bulk and dealer pricing available.",
    },
    "816046360518": {
        "Authorised EVE distributor. Imported Grade-A cells, matched and QR-traceable.":
        "Authorised EVE distributor. Grade-A cells, matched and QR-traceable, from Lahore.",
        "Corporate, dealer & tender supply nationwide. Importer since 1995.":
        "Corporate, dealer & tender supply across Pakistan. Since 1995.",
    },
}

# sitelink asset id -> field updates (sitelink descriptions <= 35 chars)
SITELINK_UPDATES = {
    "398262355670": {"description2": "Imported, 10-500kVA"},   # was "Built to order 10-500kVA"
}

BAD_WORDS = ("made in lahore", "maker", "manufactur", "built to order", "built in")


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
        return {"ERROR": e.read().decode()[:2000]}


def fetch(t):
    ids = ", ".join(sorted(set(REPLACE_HEADLINES) | set(REPLACE_DESCRIPTIONS) | set(ADD_HEADLINES)))
    q = ("SELECT campaign.name, campaign.status, ad_group.name, ad_group.status, ad_group_ad.ad.id, "
         "ad_group_ad.ad_strength, ad_group_ad.ad.responsive_search_ad.headlines, "
         "ad_group_ad.ad.responsive_search_ad.descriptions "
         f"FROM ad_group_ad WHERE ad_group_ad.ad.id IN ({ids}) AND ad_group_ad.status != REMOVED")
    res = call("googleAds:search", {"query": q}, t)
    if "ERROR" in res: raise SystemExit(res["ERROR"])
    out = {}
    for r in res.get("results", []):
        ad = r["adGroupAd"]["ad"]; rsa = ad["responsiveSearchAd"]
        out[ad["id"]] = {
            "label": f"{r['campaign']['name'][:34]} [{r['campaign']['status']}] › {r['adGroup']['name']} [{r['adGroup']['status']}]",
            "strength": r["adGroupAd"].get("adStrength"),
            # keep pinnedField so a pinned position is not silently lost on rewrite
            "headlines": [{k: h[k] for k in ("text", "pinnedField") if k in h} for h in rsa.get("headlines", [])],
            "descriptions": [{k: d[k] for k in ("text", "pinnedField") if k in d} for d in rsa.get("descriptions", [])],
        }
    return out


def validate():
    bad = []
    for m in REPLACE_HEADLINES.values():
        for new in m.values():
            if len(new) > 30: bad.append(f"headline {len(new)}>30: {new}")
    for hs in ADD_HEADLINES.values():
        for new in hs:
            if len(new) > 30: bad.append(f"headline {len(new)}>30: {new}")
    for m in REPLACE_DESCRIPTIONS.values():
        for new in m.values():
            if len(new) > 90: bad.append(f"description {len(new)}>90: {new}")
    for m in SITELINK_UPDATES.values():
        for new in m.values():
            if len(new) > 35: bad.append(f"sitelink desc {len(new)}>35: {new}")
    if bad: raise SystemExit("✗ length violations:\n  " + "\n  ".join(bad))
    print("  ✓ all new assets within Google limits")


def plan(cur):
    """Return {ad: (new_headlines, new_descriptions, changes:list[str])}."""
    out = {}
    for ad, d in cur.items():
        changes = []
        heads = []
        for h in d["headlines"]:
            new = REPLACE_HEADLINES.get(ad, {}).get(h["text"])
            if new and new != h["text"]:
                changes.append(f"H  {h['text']!r} → {new!r}")
                heads.append({**h, "text": new})
            else:
                heads.append(h)
        have = {h["text"] for h in heads}
        for h in ADD_HEADLINES.get(ad, []):
            if h in have: continue
            if len(heads) >= 15: changes.append(f"H  (skip, 15/15) +{h!r}"); continue
            heads.append({"text": h}); have.add(h); changes.append(f"H  +{h!r}")
        descs = []
        for x in d["descriptions"]:
            new = REPLACE_DESCRIPTIONS.get(ad, {}).get(x["text"])
            if new and new != x["text"]:
                changes.append(f"D  {x['text']!r} → {new!r}")
                descs.append({**x, "text": new})
            else:
                descs.append(x)
        # anything expected but not found (already applied, or text drifted)
        for old in REPLACE_HEADLINES.get(ad, {}):
            if old not in {h["text"] for h in d["headlines"]}: changes.append(f"·  headline not present (skip): {old!r}")
        for old in REPLACE_DESCRIPTIONS.get(ad, {}):
            if old not in {x["text"] for x in d["descriptions"]}: changes.append(f"·  description not present (skip): {old!r}")
        out[ad] = (heads, descs, changes)
    return out


def leftovers(heads, descs):
    """Copy that still carries an origin/market word after the rewrite (for the report)."""
    left = []
    for h in heads + descs:
        low = h["text"].lower()
        hits = [w for w in BAD_WORDS if w in low]
        if hits: left.append(f"{h['text']!r} ({', '.join(hits)})")
    return left


def show():
    validate()
    cur = fetch(token())
    p = plan(cur)
    for ad, (heads, descs, changes) in p.items():
        print(f"\n--- {cur[ad]['label']}  ad {ad}  strength={cur[ad]['strength']}")
        for c in changes: print("    " + c)
        real = [c for c in changes if not c.startswith("·")]
        print(f"    → {len(cur[ad]['headlines'])}→{len(heads)} headlines, {len(descs)} descriptions, {len(real)} edits")
        lo = leftovers(heads, descs)
        if lo: print("    still mentions: " + "; ".join(lo))
    print("\nSitelink updates:", json.dumps(SITELINK_UPDATES))


def apply():
    validate()
    t = token()
    cur = fetch(t)
    p = plan(cur)
    ops = []
    for ad, (heads, descs, changes) in p.items():
        if not [c for c in changes if not c.startswith("·")]:
            print(f"  {cur[ad]['label']}: nothing to change"); continue
        ops.append({
            "update": {
                "resourceName": f"customers/{CID}/ads/{ad}",
                "responsiveSearchAd": {"headlines": heads, "descriptions": descs},
            },
            "updateMask": "responsive_search_ad.headlines,responsive_search_ad.descriptions",
        })
        print(f"  {cur[ad]['label']}: {len(cur[ad]['headlines'])}→{len(heads)} headlines, {len(descs)} descriptions")
    if ops:
        res = call("ads:mutate", {"operations": ops, "partialFailure": False}, t)
        if "ERROR" in res:
            print(f"\n✗ ADS MUTATE FAILED:\n{res['ERROR']}"); sys.exit(1)
        print(f"\n✓ updated {len(res.get('results', []))} ad(s)")
    # sitelinks
    sops = []
    for aid, fields in SITELINK_UPDATES.items():
        sops.append({
            "update": {"resourceName": f"customers/{CID}/assets/{aid}", "sitelinkAsset": fields},
            "updateMask": ",".join(f"sitelink_asset.{k}" for k in fields),
        })
    if sops:
        res = call("assets:mutate", {"operations": sops, "partialFailure": False}, t)
        if "ERROR" in res:
            print(f"\n✗ ASSETS MUTATE FAILED:\n{res['ERROR']}"); sys.exit(1)
        print(f"✓ updated {len(res.get('results', []))} sitelink asset(s)")
    # verify
    after = fetch(token())
    print("\nAfter:")
    for ad, d in after.items():
        lo = leftovers(d["headlines"], d["descriptions"])
        print(f"  {d['label']}: {len(d['headlines'])} H / {len(d['descriptions'])} D, strength={d['strength']}"
              + (f"\n     still mentions: {'; '.join(lo)}" if lo else ""))
    print("\nEdited ads re-enter policy review briefly; ad strength is recalculated over a few hours.")


cmd = sys.argv[1] if len(sys.argv) > 1 else "show"
if cmd == "show": show()
elif cmd == "apply": apply()
else: print(__doc__)

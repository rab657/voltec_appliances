#!/usr/bin/env python3
"""Fix WHAT Google Ads counts and bids toward. Read-only by default.

DIAGNOSIS (2026-07-31): both live Search campaigns showed **0 conversions on 488 clicks/week**
(AED ~200). Cause was not "no tracking" — GA4 IS linked. It was tracking pointed at events that
never happen:
  🟢 biddable PURCHASE/WEBSITE     <- site is inquiry-only, orders table empty all-time
  🟢 biddable ADD_TO_CART/WEBSITE  <- no live checkout
  ✗ GET_DIRECTIONS/GOOGLE_HOSTED  <- NOT biddable, yet a campaign is literally named
                                     "Lahore Showroom (Calls + Directions)"
  ...and NO lead/website-contact goal at all, because the site's `lead` event was never
  marked as a Key event in GA4, so it was never importable into Google Ads.

⚠️ STEP 1 CANNOT BE DONE FROM HERE. The stored OAuth refresh token only carries scopes
`adwords` + `content` (verified via tokeninfo) — no `analytics.edit` — so the GA4 Admin API
returns 403. Marking `lead` as a Key event is a GA4 UI action for the user:
  GA4 → Admin → Data display → Events → find `lead` → toggle "Mark as key event"
  then Google Ads → Goals → Conversions → New → Import → GA4 → pick `lead`.

Safe to run now because both campaigns use **TARGET_SPEND (Maximize Clicks)**, which ignores
conversion data for bidding — so changing goals affects measurement only, not delivery.
⚠️ Do NOT switch to Maximize Conversions until `lead` is importing real data; conversion
bidding with no conversion signal is worse than Maximize Clicks.

Usage:
  python3 scripts/google-conversions.py show     # goals + actions, flags the phantoms
  python3 scripts/google-conversions.py apply    # kill phantom goals, enable GET_DIRECTIONS
  python3 scripts/google-conversions.py lead     # after GA4 import: find + enable the lead goal
"""
import json, os, pathlib, sys, urllib.parse, urllib.request

ENV = pathlib.Path(__file__).resolve().parent.parent / ".env.local"
CFG = {}
for line in ENV.read_text().splitlines():
    line = line.strip()
    if line and "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); CFG[k.strip()] = v.strip().strip('"').strip("'")
CID = CFG["GOOGLE_ADS_CUSTOMER_ID"]
API = "https://googleads.googleapis.com/v22"

# Goals that can never fire on an inquiry-only site with no live checkout.
PHANTOM = [("PURCHASE", "WEBSITE"), ("ADD_TO_CART", "WEBSITE")]
# The showroom campaign's actual purpose.
WANTED = [("GET_DIRECTIONS", "GOOGLE_HOSTED")]
# Categories a GA4 `lead` import could land in — checked by the `lead` mode.
LEADISH = ("SUBMIT_LEAD_FORM", "CONTACT", "QUALIFIED_LEAD", "CONVERTED_LEAD", "REQUEST_QUOTE")


def token():
    body = urllib.parse.urlencode({
        "client_id": CFG["GOOGLE_ADS_CLIENT_ID"], "client_secret": CFG["GOOGLE_ADS_CLIENT_SECRET"],
        "refresh_token": CFG["GOOGLE_ADS_REFRESH_TOKEN"], "grant_type": "refresh_token"}).encode()
    return json.loads(urllib.request.urlopen(
        urllib.request.Request("https://oauth2.googleapis.com/token", data=body)).read())["access_token"]


def hdrs(tok):
    return {"Authorization": f"Bearer {tok}", "developer-token": CFG["GOOGLE_ADS_DEVELOPER_TOKEN"],
            "login-customer-id": CFG["GOOGLE_ADS_LOGIN_CUSTOMER_ID"], "Content-Type": "application/json"}


def call(path, payload, tok):
    req = urllib.request.Request(f"{API}/customers/{CID}/{path}",
                                data=json.dumps(payload).encode(), headers=hdrs(tok))
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {"ERROR": e.read().decode()[:900]}


def goals(tok):
    r = call("googleAds:search", {"query":
        "SELECT customer_conversion_goal.category, customer_conversion_goal.origin, "
        "customer_conversion_goal.biddable FROM customer_conversion_goal"}, tok)
    if "ERROR" in r: raise SystemExit(r["ERROR"])
    out = []
    for row in r.get("results", []):
        g = row["customerConversionGoal"]
        out.append((g.get("category", "?"), g.get("origin", "?"), bool(g.get("biddable"))))
    return sorted(out)


def show(tok=None):
    tok = tok or token()
    print(f"{'bid?':<6}{'category':<24}origin")
    for cat, org, b in goals(tok):
        tag = ""
        if b and (cat, org) in PHANTOM: tag = "  ← PHANTOM: cannot fire on this site"
        if not b and (cat, org) in WANTED: tag = "  ← SHOULD be on (showroom campaign)"
        if cat in LEADISH: tag = tag or "  ← lead-type goal"
        print(f"{'🟢' if b else '  ':<5} {cat:<24}{org:<16}{tag}")
    have_lead = any(c in LEADISH and b for c, o, b in goals(tok))
    print(f"\nBiddable lead-type goal present: {'YES' if have_lead else 'NO — do the GA4 step'}")


def mutate(tok, ops, label):
    if not ops:
        print(f"  {label}: nothing to change"); return
    r = call("customerConversionGoals:mutate", {"operations": ops}, tok)
    if "ERROR" in r:
        print(f"  ✗ {label} FAILED:\n{r['ERROR'][:600]}")
    else:
        print(f"  ✓ {label}: {len(r.get('results', []))} goal(s) updated")


def op(cat, org, biddable):
    return {"update": {"resourceName": f"customers/{CID}/customerConversionGoals/{cat}~{org}",
                       "biddable": biddable}, "updateMask": "biddable"}


def apply_fix():
    tok = token()
    print("BEFORE:"); show(tok)
    cur = {(c, o): b for c, o, b in goals(tok)}
    print("\napplying…")
    mutate(tok, [op(c, o, False) for c, o in PHANTOM if cur.get((c, o))],
           "disable phantom goals (PURCHASE, ADD_TO_CART)")
    mutate(tok, [op(c, o, True) for c, o in WANTED if cur.get((c, o)) is False],
           "enable GET_DIRECTIONS")
    print("\nAFTER:"); show(tok)
    print("\nNEXT — and this is the part that actually unblocks measurement:\n"
          "  1. GA4 → Admin → Data display → Events → `lead` → Mark as key event\n"
          "  2. Google Ads → Goals → Conversions → New → Import → GA4 → `lead`\n"
          "  3. python3 scripts/google-conversions.py lead\n"
          "  4. ONLY THEN consider Maximize Conversions instead of Maximize Clicks.")


def lead():
    """Finish the job after `lead` is marked a key event in GA4.

    ⚠️ Marking the key event in GA4 is NOT enough. Google auto-creates the matching
    conversion action in Google Ads but lands it **status=HIDDEN, category=DEFAULT**
    (observed 2026-07-31, action 7704986591 "www.voltecappliances.com (web) lead").
    Hidden + DEFAULT means it is counted nowhere and bid on by nothing, so the
    campaigns still look like they have zero conversions. Two fixes are needed:

      1. conversion_action: status -> ENABLED, category -> SUBMIT_LEAD_FORM
      2. customer_conversion_goal SUBMIT_LEAD_FORM/WEBSITE -> biddable

    SUBMIT_LEAD_FORM rather than CONTACT on purpose: CONTACT/CALL_FROM_ADS is already
    biddable for ad call-clicks, and lumping website WhatsApp leads in with phone taps
    would make the one number we actually want to judge unreadable.
    """
    tok = token()

    # -- step 1: find GA4-imported actions that look like the lead event
    q = ("SELECT conversion_action.id, conversion_action.name, conversion_action.status, "
         "conversion_action.category, conversion_action.type FROM conversion_action "
         "WHERE conversion_action.type IN ('GOOGLE_ANALYTICS_4_CUSTOM','GOOGLE_ANALYTICS_4_PURCHASE')")
    res = call("googleAds:search", {"query": q}, tok)
    if "ERROR" in res: raise SystemExit(res["ERROR"])
    actions = [r["conversionAction"] for r in res.get("results", [])]
    leads = [a for a in actions if "lead" in a.get("name", "").lower()]
    if not leads:
        raise SystemExit(
            "No GA4 conversion action containing 'lead' exists yet.\n"
            "Mark `lead` as a key event in GA4 first (Admin -> Data display -> Events),\n"
            "then wait for Google to create the action, then re-run this.")

    ops = []
    for a in leads:
        need = a.get("status") != "ENABLED" or a.get("category") != "SUBMIT_LEAD_FORM"
        print(f"  {a['name']}: status={a.get('status')} category={a.get('category')}"
              f"{'  -> ENABLED / SUBMIT_LEAD_FORM' if need else '  (already correct)'}")
        if need:
            ops.append({
                "update": {"resourceName": f"customers/{CID}/conversionActions/{a['id']}",
                           "status": "ENABLED", "category": "SUBMIT_LEAD_FORM"},
                "updateMask": "status,category",
            })
    if ops:
        r = call("conversionActions:mutate", {"operations": ops, "partialFailure": False}, tok)
        if "ERROR" in r:
            print(f"  ✗ could not enable the action:\n{r['ERROR'][:600]}"); sys.exit(1)
        print(f"  ✓ enabled/recategorised {len(r.get('results', []))} action(s)")

    # -- step 2: make the resulting goal biddable
    cur = {(c, o): b for c, o, b in goals(tok)}
    todo = [op(c, o, True) for (c, o), b in cur.items()
            if c in LEADISH and o == "WEBSITE" and not b]
    mutate(tok, todo, "make the website lead goal biddable")
    print()
    show(tok)
    print("\nGoogle needs a few hours before conversions start reporting against this.\n"
          "Only once real lead data is flowing should you move the Search campaigns off\n"
          "TARGET_SPEND (Maximize Clicks) to a conversion-based bid strategy.")


cmd = sys.argv[1] if len(sys.argv) > 1 else "show"
if cmd == "show": show()
elif cmd == "apply": apply_fix()
elif cmd == "lead": lead()
else: print(__doc__)

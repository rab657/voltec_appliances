#!/usr/bin/env python3
"""Read / change daily budgets on Meta campaigns.

The ad account bills in **AED** and the API takes **minor units** — 2500 = AED 25.00.
Getting this wrong by 100x is the easiest expensive mistake in this repo, so `set`
prints the AED value and refuses anything that looks like a unit error.

  python3 scripts/meta-budget.py show                      # every non-archived campaign + status
  python3 scripts/meta-budget.py live                      # only what is actually spending
  python3 scripts/meta-budget.py set <campaign_id> <minor> # e.g. set 1202486... 2500  -> AED 25/day
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

# Meta's AED minimums (from /minimum_budgets): high-frequency events 923, low-frequency 7378.
MIN_SANE, MAX_SANE = 500, 50000          # AED 5 .. AED 500 per day


def api(path, method="GET", **p):
    a = ["curl", "-s", "--max-time", "60"] + (["-X", "POST"] if method == "POST" else ["-G"])
    a += [f"https://graph.facebook.com/{V}/{path}"]
    p.update(access_token=T, appsecret_proof=PROOF)
    for k, v in p.items():
        a += ["--data-urlencode", f"{k}={v}"]
    out = subprocess.run(a, capture_output=True, text=True).stdout
    try: return json.loads(out or "{}")
    except Exception: return {"raw": out[:300]}


def show(only_live=False):
    rows = api(f"{ACT}/campaigns", fields="id,name,status,effective_status,daily_budget",
               limit="200").get("data", [])
    total = 0
    for c in rows:
        live = c.get("effective_status") == "ACTIVE"
        if only_live and not live:
            continue
        b = int(c.get("daily_budget") or 0)
        if live:
            total += b
        print(f" {'🟢' if live else '⏸ '} AED {b/100:>7.2f}/day  {c['effective_status']:12} "
              f"{c['id']}  {c['name'][:48]}")
    print(f"\n TOTAL LIVE SPEND: AED {total/100:.2f}/day  (~Rs {total/100*78:,.0f})")


def set_budget(cid, minor):
    minor = int(minor)
    if not MIN_SANE <= minor <= MAX_SANE:
        raise SystemExit(f"refusing {minor} minor units (AED {minor/100:.2f}/day) — outside the "
                         f"sane range AED {MIN_SANE/100:.0f}-{MAX_SANE/100:.0f}. "
                         f"Remember: minor units, 2500 = AED 25.")
    before = api(cid, fields="name,daily_budget")
    r = api(cid, "POST", daily_budget=str(minor))
    after = api(cid, fields="name,daily_budget")
    print(f"{before.get('name')}\n  AED {int(before.get('daily_budget') or 0)/100:.2f}/day "
          f"→ AED {int(after.get('daily_budget') or 0)/100:.2f}/day   {r}")


if __name__ == "__main__":
    a = sys.argv[1:]
    cmd = a[0] if a else "show"
    if cmd == "show":   show()
    elif cmd == "live": show(only_live=True)
    elif cmd == "set":  set_budget(a[1], a[2])
    else: print(__doc__)

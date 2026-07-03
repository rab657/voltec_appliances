#!/usr/bin/env python3
"""Google Ads API helper — reads creds from web/.env.local (no secrets here).

Usage:
  python3 scripts/google-ads.py campaigns      # list campaigns + status + budget
  python3 scripts/google-ads.py gaql "SELECT ..."   # run any GAQL query

Auth: OAuth refresh token (offline) + developer token. Stdlib only.
"""
import json, os, pathlib, sys, urllib.parse, urllib.request

ENV = pathlib.Path(__file__).resolve().parent.parent / ".env.local"
VERSIONS = ["v21", "v20", "v19", "v18"]  # try newest first; Google sunsets yearly


def env() -> dict:
    d = {}
    for line in ENV.read_text().splitlines():
        line = line.strip()
        if line and "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            d[k.strip()] = v.strip().strip('"').strip("'")
    return d


CFG = env()


def access_token() -> str:
    body = urllib.parse.urlencode({
        "client_id": CFG["GOOGLE_ADS_CLIENT_ID"],
        "client_secret": CFG["GOOGLE_ADS_CLIENT_SECRET"],
        "refresh_token": CFG["GOOGLE_ADS_REFRESH_TOKEN"],
        "grant_type": "refresh_token",
    }).encode()
    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=body)
    return json.loads(urllib.request.urlopen(req).read())["access_token"]


def search(query: str):
    """Run GAQL against the account; returns (version, rows) or raises last error."""
    tok = access_token()
    cust = CFG["GOOGLE_ADS_CUSTOMER_ID"]
    last = None
    for v in VERSIONS:
        req = urllib.request.Request(
            f"https://googleads.googleapis.com/{v}/customers/{cust}/googleAds:search",
            data=json.dumps({"query": query}).encode(),
            headers={
                "Authorization": f"Bearer {tok}",
                "developer-token": CFG["GOOGLE_ADS_DEVELOPER_TOKEN"],
                "login-customer-id": CFG["GOOGLE_ADS_LOGIN_CUSTOMER_ID"],
                "Content-Type": "application/json",
            })
        try:
            res = json.loads(urllib.request.urlopen(req).read())
            return v, res.get("results", [])
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            if e.code == 404:      # version sunset / not yet known — try next
                last = f"{v}: 404"
                continue
            raise SystemExit(f"API error on {v} (HTTP {e.code}):\n{body[:1200]}")
    raise SystemExit(f"No API version worked: {last}")


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "campaigns"
    if cmd == "campaigns":
        v, rows = search(
            "SELECT campaign.id, campaign.name, campaign.status, "
            "campaign.advertising_channel_type, campaign_budget.amount_micros "
            "FROM campaign ORDER BY campaign.status")
        print(f"API {v} · account {CFG['GOOGLE_ADS_CUSTOMER_ID']} · {len(rows)} campaigns\n")
        for r in rows:
            c = r["campaign"]; b = r.get("campaignBudget", {})
            budget = int(b.get("amountMicros", 0)) / 1e6
            print(f"  {c['id']}  {c['status']:<8} {c.get('advertisingChannelType','?'):<14}"
                  f" {budget:>8,.0f}/day  {c['name'][:48]}")
    elif cmd == "gaql":
        v, rows = search(sys.argv[2])
        print(f"API {v} · {len(rows)} rows")
        print(json.dumps(rows, indent=1)[:4000])
    else:
        print(__doc__)


if __name__ == "__main__":
    main()

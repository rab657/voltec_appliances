#!/usr/bin/env python3
"""Keyword rank report from Google Search Console — the scoreboard for "I want to win."

Reads REAL Google data (position, impressions, clicks per query — Pakistan only) for
the target keywords of both SEO clusters, prints a scoreboard, and appends every run
to .data/rank-history.csv so movement is visible week over week.

⚠️ Needs the `webmasters.readonly` scope on the Google refresh token. If you see a
403/insufficient-scope error: run `python3 scripts/google-ads-auth.py` once (browser
consent — sign in with the account that owns Search Console), paste the new refresh
token into .env.local, re-run this.

Usage:
  python3 scripts/rank-report.py            # last 7 days vs previous 7
  python3 scripts/rank-report.py 28         # last 28 days vs previous 28
"""
import csv, json, pathlib, sys, urllib.parse, urllib.request
from datetime import date, timedelta

ROOT = pathlib.Path(__file__).resolve().parent.parent
CFG = {}
for line in (ROOT / ".env.local").read_text().splitlines():
    line = line.strip()
    if line and "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); CFG[k.strip()] = v.strip().strip('"').strip("'")

# The keywords we are fighting for. Grouped so the report reads as two battles.
TARGETS = {
    "cells": [
        "eve cells", "eve cells in pakistan", "genuine eve cells", "eve lf100la",
        "eve cells price", "lifepo4 cells pakistan", "lithium cells pakistan",
        "authorized distributor of eve cells",
    ],
    "stabilizer": [
        "voltage stabilizer", "voltage stabilizer price in pakistan", "stabilizer price",
        "servo stabilizer", "servo voltage stabilizer", "svc stabilizer",
        "3 phase stabilizer", "100 kva stabilizer", "stabilizer for ac",
        "best stabilizer in pakistan", "voltec",
    ],
}

def token():
    body = urllib.parse.urlencode({
        "client_id": CFG["GOOGLE_ADS_CLIENT_ID"], "client_secret": CFG["GOOGLE_ADS_CLIENT_SECRET"],
        "refresh_token": CFG["GOOGLE_ADS_REFRESH_TOKEN"], "grant_type": "refresh_token"}).encode()
    return json.loads(urllib.request.urlopen(
        urllib.request.Request("https://oauth2.googleapis.com/token", data=body)).read())["access_token"]

def query(tok, site, start, end):
    req = urllib.request.Request(
        f"https://searchconsole.googleapis.com/webmasters/v3/sites/{urllib.parse.quote(site, safe='')}/searchAnalytics/query",
        data=json.dumps({"startDate": str(start), "endDate": str(end),
                         "dimensions": ["query"], "rowLimit": 5000,
                         "dimensionFilterGroups": [{"filters": [
                             {"dimension": "country", "operator": "equals", "expression": "pak"}]}],
                         }).encode(),
        headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return {row["keys"][0]: row for row in json.loads(r.read()).get("rows", [])}

def matches(q, kw):
    return kw in q  # substring: "eve cells" also catches "eve cells lahore price"

def main():
    days = int(sys.argv[1]) if len(sys.argv) > 1 else 7
    tok = token()
    # GSC property can be URL-prefix or domain — try both.
    last_err = None
    for site in ("sc-domain:voltecappliances.com", "https://voltecappliances.com/"):
        try:
            end = date.today() - timedelta(days=2)          # GSC data lags ~2 days
            cur = query(tok, site, end - timedelta(days=days - 1), end)
            prv = query(tok, site, end - timedelta(days=2 * days - 1), end - timedelta(days=days))
            break
        except urllib.error.HTTPError as e:
            last_err = e.read().decode()[:300]
    else:
        raise SystemExit(f"Search Console query failed for both property formats.\n{last_err}\n"
                         "If it says insufficient scopes: run scripts/google-ads-auth.py once "
                         "and update GOOGLE_ADS_REFRESH_TOKEN in .env.local.")

    hist = ROOT / ".data" / "rank-history.csv"
    newfile = not hist.exists()
    out = hist.open("a", newline="")
    w = csv.writer(out)
    if newfile:
        w.writerow(["run_date", "window_days", "cluster", "keyword", "position", "impressions", "clicks"])

    print(f"\n  KEYWORD SCOREBOARD — Pakistan, last {days}d vs previous {days}d (site: {site})")
    for cluster, kws in TARGETS.items():
        print(f"\n  ── {cluster.upper()} ──")
        print(f"  {'keyword':<42}{'pos':>6}{'Δpos':>7}{'impr':>7}{'clicks':>7}")
        for kw in kws:
            # aggregate every real query containing the target phrase
            def agg(d):
                rows = [r for q, r in d.items() if matches(q, kw)]
                if not rows: return None
                impr = sum(r["impressions"] for r in rows)
                pos = sum(r["position"] * r["impressions"] for r in rows) / max(impr, 1)
                return {"pos": pos, "impr": impr, "clicks": sum(r["clicks"] for r in rows)}
            c, p_ = agg(cur), agg(prv)
            if not c:
                print(f"  {kw:<42}{'—':>6}{'':>7}{0:>7}{0:>7}   (not appearing yet)")
                w.writerow([date.today(), days, cluster, kw, "", 0, 0])
                continue
            delta = f"{(p_['pos'] - c['pos']):+.1f}" if p_ else "new"
            print(f"  {kw:<42}{c['pos']:>6.1f}{delta:>7}{c['impr']:>7}{c['clicks']:>7}")
            w.writerow([date.today(), days, cluster, kw, round(c["pos"], 1), c["impr"], c["clicks"]])
    out.close()
    print(f"\n  appended to {hist} — run weekly; Δpos positive = climbing.")
    print("  Positions 1-10 = page one. The goal: every keyword above, position < 5.\n")

main()

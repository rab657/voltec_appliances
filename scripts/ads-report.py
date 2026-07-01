#!/usr/bin/env python3
"""Per-creative performance read for the Lahore solar campaign.

Usage:
  python3 scripts/ads-report.py            # last 7 days (default)
  python3 scripts/ads-report.py today
  python3 scripts/ads-report.py yesterday
  python3 scripts/ads-report.py maximum     # lifetime

Reads creds from web/.env.local (META_ADS_TOKEN, META_APP_SECRET,
META_GRAPH_VERSION). Read-only — never changes the campaign.
"""
import os, sys, json, subprocess, hmac, hashlib, pathlib

CAMP = "120247959846160617"  # Voltec — Solar / Lahore [V1·V2·V3]

def load_env():
    env = pathlib.Path(__file__).resolve().parent.parent / ".env.local"
    for line in env.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

def main():
    load_env()
    T = os.environ["META_ADS_TOKEN"]
    SEC = os.environ["META_APP_SECRET"]
    V = os.environ.get("META_GRAPH_VERSION", "v21.0")
    proof = hmac.new(SEC.encode(), T.encode(), hashlib.sha256).hexdigest()
    preset = sys.argv[1] if len(sys.argv) > 1 else "last_7d"

    fields = "ad_name,impressions,clicks,spend,ctr,cpc,actions,cost_per_action_type,inline_link_clicks"
    a = ["curl", "-s", "-G", f"https://graph.facebook.com/{V}/{CAMP}/insights",
         "--data-urlencode", "level=ad",
         "--data-urlencode", f"fields={fields}",
         "--data-urlencode", f"date_preset={preset}",
         "--data-urlencode", f"access_token={T}",
         "--data-urlencode", f"appsecret_proof={proof}"]
    res = json.loads(subprocess.run(a, capture_output=True, text=True).stdout)
    rows = res.get("data")
    if rows is None:
        print("API error:", json.dumps(res, indent=2)); return
    if not rows:
        print(f"No delivery yet for '{preset}'. Check again once spend > 0."); return

    def action(r, key, bucket="actions"):
        for x in (r.get(bucket) or []):
            if x.get("action_type") == key:
                return float(x.get("value", 0))
        return 0.0

    print(f"\n  Voltec — Solar / Lahore   ({preset})")
    print("  " + "-" * 78)
    print(f"  {'Creative':<10}{'Spend':>9}{'Impr':>9}{'Clicks':>8}{'CTR':>7}{'CPC':>8}{'Leads':>7}{'Cost/Lead':>11}")
    print("  " + "-" * 78)
    tot = {"spend": 0, "impr": 0, "clk": 0, "lead": 0}
    for r in sorted(rows, key=lambda x: x.get("ad_name", "")):
        spend = float(r.get("spend", 0))
        impr = int(r.get("impressions", 0))
        clk = int(r.get("inline_link_clicks", r.get("clicks", 0)))
        ctr = float(r.get("ctr", 0))
        cpc = float(r.get("cpc", 0))
        # Lead counts both the Pixel "Lead" and "Contact" (WhatsApp/phone) actions.
        leads = action(r, "lead") + action(r, "onsite_conversion.lead_grouped")
        contacts = action(r, "onsite_web_lead") or 0
        leads = max(leads, action(r, "offsite_conversion.fb_pixel_lead"))
        cpl = (spend / leads) if leads else 0
        name = r.get("ad_name", "?").replace("Solar Lahore — ", "")
        cpl_s = f"{cpl:,.0f}" if leads else "—"
        print(f"  {name:<10}{spend:>9,.0f}{impr:>9,}{clk:>8,}{ctr:>6.2f}%{cpc:>8,.1f}{leads:>7.0f}{cpl_s:>11}")
        tot["spend"] += spend; tot["impr"] += impr; tot["clk"] += clk; tot["lead"] += leads
    print("  " + "-" * 78)
    tcpl = f"{tot['spend']/tot['lead']:,.0f}" if tot["lead"] else "—"
    print(f"  {'TOTAL':<10}{tot['spend']:>9,.0f}{tot['impr']:>9,}{tot['clk']:>8,}{'':>7}{'':>8}{tot['lead']:>7.0f}{tcpl:>11}")
    print(f"\n  Currency = your ad account default (AED). Leads = Pixel Lead/Contact events.\n")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Upload a hashed-phone CSV (from maps-prospects.py sweeps) as a Meta Custom Audience.

Usage:
  python3 scripts/meta-upload-audience.py <hashes.csv> "<Audience name>" ["description"]

CSV format: header row `phone`, then one SHA256(phone-in-92xxxxxxxxxx-form) per line —
exactly what maps-prospects.py / the compile steps emit as *.meta-audience.csv.

These are business numbers from public Google listings → customer_file_source is
PARTNER_PROVIDED_ONLY. Match rate will be well under 100% (landlines, secondary SIMs);
the audience populates over ~1-24h. For ads targeting ONLY — never bulk WhatsApp
(standing rule 2026-07-30)."""
import csv, json, os, pathlib, subprocess, hmac, hashlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
for line in (ROOT / ".env.local").read_text().splitlines():
    line = line.strip()
    if line and "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
T = os.environ["META_ADS_TOKEN"]; SEC = os.environ["META_APP_SECRET"]
V = os.environ.get("META_GRAPH_VERSION", "v21.0")
PROOF = hmac.new(SEC.encode(), T.encode(), hashlib.sha256).hexdigest()
ACT = "act_643241794546739"


def api(path, method="GET", **params):
    a = ["curl", "-s", "--max-time", "90"] + (["-X", "POST"] if method == "POST" else ["-G"])
    a += [f"https://graph.facebook.com/{V}/{path}"]
    params.update(access_token=T, appsecret_proof=PROOF)
    for k, v in params.items():
        a += ["--data-urlencode", f"{k}={v}"]
    out = subprocess.run(a, capture_output=True, text=True).stdout
    try: return json.loads(out or "{}")
    except Exception: return {"raw": out[:300]}


def main():
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    path, name = pathlib.Path(sys.argv[1]), sys.argv[2]
    desc = sys.argv[3] if len(sys.argv) > 3 else f"Places-sweep trade prospects ({path.name})"
    if not path.is_absolute():
        path = ROOT / path
    hashes = [r[0] for r in list(csv.reader(open(path)))[1:] if r and len(r[0]) == 64]
    if not hashes:
        raise SystemExit(f"✗ no 64-char hashes found in {path}")
    print(f"{len(hashes)} hashed phones from {path.name}")

    ca = api(f"{ACT}/customaudiences", "POST", name=name, subtype="CUSTOM",
             customer_file_source="PARTNER_PROVIDED_ONLY", description=desc)
    if not ca.get("id"):
        err = json.dumps(ca)[:400]
        if "terms" in err.lower() or "tos" in err.lower() or '"code":2654' in err:
            raise SystemExit("✗ Custom Audience ToS not accepted on this account — accept once at\n"
                             "  business.facebook.com/ads/manage/customaudiences/tos\n  then rerun. " + err)
        raise SystemExit(f"✗ create failed: {err}")
    print(f"  audience created: {ca['id']}  ({name})")

    up = api(f"{ca['id']}/users", "POST",
             payload=json.dumps({"schema": "PHONE_SHA256", "data": [[h] for h in hashes]}))
    if up.get("error"):
        raise SystemExit(f"✗ upload failed (audience {ca['id']} exists, rerun upload): "
                         f"{json.dumps(up)[:300]}")
    print(f"  ✓ uploaded: num_received={up.get('num_received')} "
          f"(session {up.get('session_id', '—')})")
    print("  Audience populates over ~1-24h as numbers match FB accounts. Ads targeting only.")


if __name__ == "__main__":
    main()

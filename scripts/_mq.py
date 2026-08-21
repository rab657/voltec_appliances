#!/usr/bin/env python3
"""Ad-hoc Meta Graph query helper. python3 scripts/_mq.py <path> [k=v ...] [--post]"""
import json, os, pathlib, subprocess, hmac, hashlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
for line in (ROOT / ".env.local").read_text().splitlines():
    line = line.strip()
    if line and "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
T = os.environ["META_ADS_TOKEN"]; SEC = os.environ["META_APP_SECRET"]
V = os.environ.get("META_GRAPH_VERSION", "v21.0")
PROOF = hmac.new(SEC.encode(), T.encode(), hashlib.sha256).hexdigest()
def api(path, method="GET", token=None, **p):
    tok = token or T
    proof = hmac.new(SEC.encode(), tok.encode(), hashlib.sha256).hexdigest()
    a = ["curl", "-s", "--max-time", "90"] + (["-X", "POST"] if method == "POST" else ["-G"])
    a += [f"https://graph.facebook.com/{V}/{path}"]
    p.update(access_token=tok, appsecret_proof=proof)
    for k, v in p.items(): a += ["--data-urlencode", f"{k}={v}"]
    out = subprocess.run(a, capture_output=True, text=True).stdout
    try: return json.loads(out or "{}")
    except Exception: return {"raw": out[:400]}
if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a != "--post"]
    method = "POST" if "--post" in sys.argv else "GET"
    kw = dict(a.split("=", 1) for a in args[1:])
    print(json.dumps(api(args[0], method, **kw), indent=1)[:6000])

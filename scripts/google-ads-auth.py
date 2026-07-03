#!/usr/bin/env python3
"""One-time Google Ads OAuth: mints the refresh token for .env.local.

Prereqs: GOOGLE_ADS_CLIENT_ID + GOOGLE_ADS_CLIENT_SECRET filled in web/.env.local
(OAuth client type must be "Desktop app").

Run:  python3 scripts/google-ads-auth.py
It opens your browser; sign in with the Google account that owns the Ads
account and click Allow. The refresh token is printed and auto-filled into
.env.local if the slot is empty. Stdlib only — no pip installs.
"""
import http.server, json, os, pathlib, socketserver, threading, urllib.parse, urllib.request, webbrowser

ENV = pathlib.Path(__file__).resolve().parent.parent / ".env.local"
PORT = 8765
# Ads + Merchant Center (Content API) — one token drives both.
SCOPE = "https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/content"


def env() -> dict:
    d = {}
    for line in ENV.read_text().splitlines():
        line = line.strip()
        if line and "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            d[k.strip()] = v.strip().strip('"').strip("'")
    return d


def main():
    cfg = env()
    cid, secret = cfg.get("GOOGLE_ADS_CLIENT_ID"), cfg.get("GOOGLE_ADS_CLIENT_SECRET")
    if not cid or not secret:
        print("Fill GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_CLIENT_SECRET in .env.local first.")
        return

    redirect = f"http://localhost:{PORT}"
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode({
        "client_id": cid, "redirect_uri": redirect, "response_type": "code",
        "scope": SCOPE, "access_type": "offline", "prompt": "consent",
    })

    code_holder = {}

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            qs = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            code_holder["code"] = (qs.get("code") or [""])[0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(b"<h2>Done - you can close this tab and return to the terminal.</h2>")

        def log_message(self, *a):  # keep the terminal clean
            pass

    print("Opening browser for Google consent… (sign in with the Ads account owner)")
    with socketserver.TCPServer(("localhost", PORT), Handler) as srv:
        threading.Thread(target=webbrowser.open, args=(auth_url,), daemon=True).start()
        print(f"If the browser didn't open, visit:\n\n{auth_url}\n")
        srv.handle_request()  # one request: the redirect with ?code=

    code = code_holder.get("code")
    if not code:
        print("No code received - try again.")
        return

    body = urllib.parse.urlencode({
        "code": code, "client_id": cid, "client_secret": secret,
        "redirect_uri": redirect, "grant_type": "authorization_code",
    }).encode()
    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=body)
    tok = json.loads(urllib.request.urlopen(req).read())
    refresh = tok.get("refresh_token")
    if not refresh:
        print("Token exchange failed:", json.dumps(tok, indent=2))
        return

    print("\nRefresh token:\n\n  " + refresh + "\n")
    text = ENV.read_text()
    if "GOOGLE_ADS_REFRESH_TOKEN=\n" in text or text.rstrip().endswith("GOOGLE_ADS_REFRESH_TOKEN="):
        ENV.write_text(text.replace("GOOGLE_ADS_REFRESH_TOKEN=", f"GOOGLE_ADS_REFRESH_TOKEN={refresh}", 1))
        print("Auto-filled into .env.local ✓")
    else:
        print("GOOGLE_ADS_REFRESH_TOKEN already set - paste manually if you want to replace it.")


if __name__ == "__main__":
    main()

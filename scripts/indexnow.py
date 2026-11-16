#!/usr/bin/env python3
"""IndexNow — tell Bing (and Yandex, Seznam, Naver) about new or changed pages.

WHY (Raheel, 2026-11-16: "let's optimize for Bing too"): ChatGPT's web search leans
heavily on Bing's index. Bing only finds new pages when it next crawls; IndexNow
asks it to fetch them now. Every IndexNow engine shares submissions, so one ping
reaches all of them.

The key is PUBLIC by design — it is served at https://voltecappliances.com/<key>.txt
(public/<key>.txt) so the engines can confirm the site owns the submission.

Usage:
  python3 scripts/indexnow.py --sitemap            # submit every URL in the live sitemap
  python3 scripts/indexnow.py URL [URL ...]        # submit specific pages (e.g. a new blog post)
  python3 scripts/indexnow.py --sitemap --dry      # list what would be sent

Run it after every deploy that adds or changes pages, and after publishing a blog
post (posts go live from Supabase without a deploy). Log: .data/indexnow-log.jsonl
"""
import json, pathlib, re, sys, time, urllib.request

HOST = "voltecappliances.com"
KEY = "0f763230102312c3b544d6fa4ba91bdf"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"
LOG = pathlib.Path(__file__).resolve().parent.parent / ".data" / "indexnow-log.jsonl"


def sitemap_urls() -> list[str]:
    xml = urllib.request.urlopen(f"https://{HOST}/sitemap.xml", timeout=30).read().decode()
    return re.findall(r"<loc>([^<]+)</loc>", xml)


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    urls = sitemap_urls() if "--sitemap" in sys.argv else args
    urls = [u.strip() for u in urls if u.strip().startswith(f"https://{HOST}/") or u.strip() == f"https://{HOST}"]
    urls = list(dict.fromkeys(urls))  # dedupe, keep order
    if not urls:
        sys.exit("No voltecappliances.com URLs to submit. Pass URLs or --sitemap.")

    # The key file must be live, or every engine rejects the batch (403).
    live = urllib.request.urlopen(KEY_LOCATION, timeout=30).read().decode().strip()
    if live != KEY:
        sys.exit(f"Key file at {KEY_LOCATION} does not match — deploy public/{KEY}.txt first.")

    if "--dry" in sys.argv:
        print("\n".join(urls))
        print(f"\n{len(urls)} URLs (dry run, nothing sent)")
        return

    status = 0
    for i in range(0, len(urls), 10000):  # protocol limit per request
        batch = urls[i : i + 10000]
        body = json.dumps({"host": HOST, "key": KEY, "keyLocation": KEY_LOCATION, "urlList": batch}).encode()
        req = urllib.request.Request(ENDPOINT, data=body, headers={"Content-Type": "application/json; charset=utf-8"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                status = r.status
        except urllib.error.HTTPError as e:
            # Never swallow the error: an empty success and a failure must not look alike.
            sys.exit(f"IndexNow HTTP {e.code}: {e.read().decode()[:300]}")
        print(f"IndexNow HTTP {status} — {len(batch)} URLs accepted (200 = ok, 202 = accepted, key check pending)")

    LOG.parent.mkdir(exist_ok=True)
    with LOG.open("a") as f:
        f.write(json.dumps({"at": time.strftime("%Y-%m-%dT%H:%M:%S%z"), "status": status, "count": len(urls), "urls": urls}) + "\n")


if __name__ == "__main__":
    main()

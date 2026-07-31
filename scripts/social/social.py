#!/usr/bin/env python3
"""Group-posting bookkeeping for the fb-post agent.

The posting itself is browser-driven (Meta killed the Groups publishing API, and
group membership isn't reachable from any token). This just answers "who is safe
to post to right now" and records what actually went out, so we never spam a group
twice inside its cadence window.

  python3 scripts/social/social.py eligible [campaign]   # who can we post to today
  python3 scripts/social/social.py log <group_url> <variant> [--url POST_URL] [--status ok|blocked|pending]
  python3 scripts/social/social.py history [group_url]
"""
import json, sys, pathlib, datetime

HERE = pathlib.Path(__file__).resolve().parent
GROUPS = HERE / "groups.json"
LOG = HERE / "post-log.json"
TODAY = datetime.date.today()


def load(p, fallback):
    return json.loads(p.read_text()) if p.exists() else fallback


def save(p, data):
    p.write_text(json.dumps(data, indent=2) + "\n")


def days_since(iso):
    if not iso:
        return 10**6
    return (TODAY - datetime.date.fromisoformat(iso[:10])).days


def eligible(campaign=None):
    reg = load(GROUPS, {})
    d = reg.get("defaults", {})
    groups = reg.get("groups", [])
    if not groups:
        print("registry is empty — build it first (read facebook.com/groups/joins in Chrome)")
        return

    log = load(LOG, {"posts": []})["posts"]
    today_count = sum(1 for e in log if e.get("date", "")[:10] == TODAY.isoformat()
                      and e.get("status") == "ok")
    cap = d.get("max_posts_per_day", 5)
    print(f"posted today: {today_count}/{cap}   (min {d.get('min_minutes_between_posts',20)} min apart)\n")

    ready, waiting, blocked = [], [], []
    for g in groups:
        cad = g.get("cadence_days", d.get("cadence_days", 30))
        since = days_since(g.get("last_posted"))
        if g.get("promo_ok") is False:
            blocked.append((g, "promo banned by group rules"))
        elif since < cad:
            waiting.append((g, f"{cad - since}d left in cadence"))
        else:
            ready.append((g, since))

    print(f"READY ({len(ready)}) — sorted by relevance then size")
    order = {"high": 0, "medium": 1, "low": 2}
    for g, since in sorted(ready, key=lambda x: (order.get(x[0].get("relevance"), 3),
                                                 -(x[0].get("members") or 0))):
        last = f"last {since}d ago (variant {g.get('last_variant')})" if g.get("last_posted") else "never posted"
        promo = g.get("promo_ok")
        flag = "" if promo is True else f"  ⚠ {promo}"
        share = "" if g.get("shares_ok", True) else "  ⚠ shares blocked — needs native post"
        print(f"  · {g['name']}  [{g.get('relevance','?')}, {g.get('members') or '?'} members] — {last}{flag}{share}")
        print(f"    {g['url']}")

    if waiting:
        print(f"\nWAITING ({len(waiting)})")
        for g, why in waiting:
            print(f"  · {g['name']} — {why}")
    if blocked:
        print(f"\nBLOCKED ({len(blocked)})")
        for g, why in blocked:
            print(f"  · {g['name']} — {why}")

    if today_count >= cap:
        print(f"\n🛑 daily cap reached ({cap}). Stop for today.")


def log_post(url, variant, post_url=None, status="ok"):
    log = load(LOG, {"posts": []})
    log["posts"].append({
        "date": datetime.datetime.now().isoformat(timespec="seconds"),
        "group_url": url, "variant": variant, "post_url": post_url, "status": status,
    })
    save(LOG, log)

    reg = load(GROUPS, {})
    for g in reg.get("groups", []):
        if g["url"].rstrip("/") == url.rstrip("/"):
            if status == "ok":
                g["last_posted"] = TODAY.isoformat()
                g["last_variant"] = variant
            save(GROUPS, reg)
            print(f"logged [{status}] {variant} → {g['name']}")
            return
    print(f"logged [{status}] {variant} → {url}  (⚠ not in registry)")


def history(url=None):
    for e in load(LOG, {"posts": []})["posts"]:
        if url and e["group_url"].rstrip("/") != url.rstrip("/"):
            continue
        print(f"{e['date'][:16]}  [{e['status']:7}] {e['variant']}  {e['group_url']}")


if __name__ == "__main__":
    a = sys.argv[1:]
    cmd = a[0] if a else "eligible"
    if cmd == "eligible":
        eligible(a[1] if len(a) > 1 else None)
    elif cmd == "log":
        kw = {}
        if "--url" in a:
            kw["post_url"] = a[a.index("--url") + 1]
        if "--status" in a:
            kw["status"] = a[a.index("--status") + 1]
        log_post(a[1], a[2], **kw)
    elif cmd == "history":
        history(a[1] if len(a) > 1 else None)
    else:
        print(__doc__)

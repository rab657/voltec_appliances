#!/usr/bin/env python3
"""Build a prospect list of battery assemblers / dealers from Google Maps.

Uses the official **Places API (New)** — not scraping. Scraping Maps breaks Google's
ToS and gets IPs blocked; the API returns the same data legitimately.

  export GOOGLE_MAPS_API_KEY=...        (or put it in .env.local)
  python3 scripts/maps-prospects.py lahore
  python3 scripts/maps-prospects.py lahore --out .data/prospects-lahore

Outputs three files:
  <out>.json   full records (name, address, phone, website, rating, area, coords)
  <out>.csv    call sheet for the sales team, sorted by area then rating
  <out>.meta-audience.csv  SHA256-hashed phones, ready to upload as a Meta Custom Audience

The Custom Audience file is the point: it turns this list into an ad audience we can
target directly (and seed a Lookalike from) — which is a compliant way to "reach every
assembler at scale". Cold-blasting these numbers on WhatsApp is NOT (see README notes).
"""
import json, os, csv, sys, time, pathlib, subprocess, hashlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
envf = ROOT / ".env.local"
if envf.exists():
    for line in envf.read_text().splitlines():
        line = line.strip()
        if line and "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

KEY = os.environ.get("GOOGLE_MAPS_API_KEY")
if not KEY:
    raise SystemExit(
        "Missing GOOGLE_MAPS_API_KEY.\n"
        "  1. console.cloud.google.com → same project as Google Ads\n"
        "  2. Enable 'Places API (New)'  3. Credentials → Create API key\n"
        "  4. Restrict it to the Places API  5. Add GOOGLE_MAPS_API_KEY=... to web/.env.local"
    )

# Search terms — deliberately broad. Small assemblers rarely list themselves as
# "battery assembler"; they show up as battery/solar/UPS/inverter shops.
TERMS = [
    "lithium battery shop", "battery shop", "battery dealer", "battery wholesaler",
    "lifepo4 battery", "solar battery", "UPS battery shop", "inverter shop",
    "solar panel installer", "solar energy company", "battery pack manufacturer",
    "electric battery store", "dry battery shop", "solar system installer",
]

CITIES = {
    # rough bounding boxes — low/high corners
    "lahore":     {"low": {"latitude": 31.35, "longitude": 74.15}, "high": {"latitude": 31.68, "longitude": 74.55}},
    "faisalabad": {"low": {"latitude": 31.30, "longitude": 72.95}, "high": {"latitude": 31.53, "longitude": 73.20}},
    "gujranwala": {"low": {"latitude": 32.10, "longitude": 74.10}, "high": {"latitude": 32.24, "longitude": 74.25}},
    "multan":     {"low": {"latitude": 30.10, "longitude": 71.35}, "high": {"latitude": 30.29, "longitude": 71.55}},
    "rawalpindi": {"low": {"latitude": 33.50, "longitude": 72.98}, "high": {"latitude": 33.68, "longitude": 73.15}},
    "peshawar":   {"low": {"latitude": 33.94, "longitude": 71.40}, "high": {"latitude": 34.05, "longitude": 71.63}},
}

FIELDS = ("places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,"
          "places.internationalPhoneNumber,places.websiteUri,places.rating,"
          "places.userRatingCount,places.types,places.location,places.businessStatus,"
          "nextPageToken")


def search(term, box, page_token=None):
    body = {"textQuery": term, "locationRestriction": {"rectangle": box}, "pageSize": 20}
    if page_token:
        body["pageToken"] = page_token
    p = subprocess.run(
        ["curl", "-s", "--max-time", "45", "-X", "POST",
         "https://places.googleapis.com/v1/places:searchText",
         "-H", f"X-Goog-Api-Key: {KEY}", "-H", "Content-Type: application/json",
         "-H", f"X-Goog-FieldMask: {FIELDS}", "-d", json.dumps(body)],
        capture_output=True, text=True)
    try:
        return json.loads(p.stdout or "{}")
    except Exception:
        return {"_raw": p.stdout[:300]}


def e164(rec):
    """+92 3xx xxxxxxx -> 923xxxxxxxxx (Meta wants digits only, no +)."""
    raw = rec.get("internationalPhoneNumber") or rec.get("nationalPhoneNumber") or ""
    d = re.sub(r"\D", "", raw)
    if d.startswith("0"):
        d = "92" + d[1:]
    return d if d.startswith("92") and len(d) >= 11 else ""


def area_of(addr):
    """Crude neighbourhood extraction for route planning / sorting."""
    parts = [p.strip() for p in (addr or "").split(",")]
    return parts[-3] if len(parts) >= 3 else (parts[0] if parts else "")


def main():
    city = (sys.argv[1] if len(sys.argv) > 1 else "lahore").lower()
    if city not in CITIES:
        raise SystemExit(f"unknown city '{city}' — choose from: {', '.join(CITIES)}")
    out = ".data/prospects-" + city
    if "--out" in sys.argv:
        out = sys.argv[sys.argv.index("--out") + 1]
    outp = ROOT / out
    outp.parent.mkdir(parents=True, exist_ok=True)

    box, found, calls = CITIES[city], {}, 0
    for term in TERMS:
        token, page = None, 0
        while page < 3:                      # Places caps Text Search at ~60 results
            r = search(term, box, token)
            calls += 1
            if r.get("error"):
                print(f"  ! {term}: {r['error'].get('message','')[:120]}")
                break
            for pl in r.get("places", []):
                if pl.get("businessStatus") in ("CLOSED_PERMANENTLY", "CLOSED_TEMPORARILY"):
                    continue
                found.setdefault(pl["id"], pl)
            token = r.get("nextPageToken")
            page += 1
            if not token:
                break
            time.sleep(2)                    # nextPageToken needs a moment to become valid
        print(f"  {term:32} → {len(found)} unique so far")

    rows = []
    for pl in found.values():
        addr = pl.get("formattedAddress", "")
        rows.append({
            "name": (pl.get("displayName") or {}).get("text", ""),
            "phone": pl.get("nationalPhoneNumber", ""),
            "phone_e164": e164(pl),
            "area": area_of(addr),
            "address": addr,
            "website": pl.get("websiteUri", ""),
            "rating": pl.get("rating", ""),
            "reviews": pl.get("userRatingCount", ""),
            "maps_url": f"https://www.google.com/maps/place/?q=place_id:{pl['id']}",
            "lat": (pl.get("location") or {}).get("latitude", ""),
            "lng": (pl.get("location") or {}).get("longitude", ""),
        })
    rows.sort(key=lambda r: (r["area"], -(r["reviews"] or 0) if isinstance(r["reviews"], int) else 0))

    (outp.with_suffix(".json")).write_text(json.dumps(rows, indent=1))
    with open(outp.with_suffix(".csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()) if rows else ["name"])
        w.writeheader(); w.writerows(rows)

    # Meta Custom Audience: SHA256 of the normalised phone, per Meta's hashing spec.
    withphone = [r for r in rows if r["phone_e164"]]
    with open(str(outp) + ".meta-audience.csv", "w", newline="") as f:
        w = csv.writer(f); w.writerow(["phone"])
        for r in withphone:
            w.writerow([hashlib.sha256(r["phone_e164"].encode()).hexdigest()])

    print(f"\n{len(rows)} businesses  ({len(withphone)} with a usable phone)  ~{calls} API calls")
    print(f"  {outp}.json / .csv          → call sheet")
    print(f"  {outp}.meta-audience.csv    → upload as a Meta Custom Audience")
    areas = {}
    for r in rows:
        areas[r["area"]] = areas.get(r["area"], 0) + 1
    print("\ntop areas:")
    for a, n in sorted(areas.items(), key=lambda x: -x[1])[:12]:
        print(f"   {n:>4}  {a}")


if __name__ == "__main__":
    main()

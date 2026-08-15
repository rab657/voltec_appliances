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

# Lithium-focused subset for metro sweeps (2026-08-05, Punjab assembler push):
# in big cities the broad TERMS drown in lead-acid car-battery shops; these 8 keep
# the sweep on assemblers, pack builders and their suppliers. Use with --lithium.
LITHIUM_TERMS = [
    "lithium battery", "lithium battery assembler", "lifepo4 battery",
    "lithium battery pack", "battery pack manufacturer",
    "lithium battery manufacturer", "lithium solar battery", "battery BMS",
]

CITIES = {
    # rough bounding boxes — low/high corners
    "lahore":     {"low": {"latitude": 31.35, "longitude": 74.15}, "high": {"latitude": 31.68, "longitude": 74.55}},
    "faisalabad": {"low": {"latitude": 31.30, "longitude": 72.95}, "high": {"latitude": 31.53, "longitude": 73.20}},
    "gujranwala": {"low": {"latitude": 32.10, "longitude": 74.10}, "high": {"latitude": 32.24, "longitude": 74.25}},
    "multan":     {"low": {"latitude": 30.10, "longitude": 71.35}, "high": {"latitude": 30.29, "longitude": 71.55}},
    "rawalpindi": {"low": {"latitude": 33.50, "longitude": 72.98}, "high": {"latitude": 33.68, "longitude": 73.15}},
    "peshawar":   {"low": {"latitude": 33.94, "longitude": 71.40}, "high": {"latitude": 34.05, "longitude": 71.63}},
    # Punjab secondary cities (added 2026-08-05 for the assembler push).
    "sialkot":      {"low": {"latitude": 32.44, "longitude": 74.46}, "high": {"latitude": 32.56, "longitude": 74.60}},
    "gujrat":       {"low": {"latitude": 32.52, "longitude": 74.02}, "high": {"latitude": 32.63, "longitude": 74.14}},
    "sargodha":     {"low": {"latitude": 32.02, "longitude": 72.62}, "high": {"latitude": 32.13, "longitude": 72.73}},
    "bahawalpur":   {"low": {"latitude": 29.34, "longitude": 71.62}, "high": {"latitude": 29.45, "longitude": 71.75}},
    "rahimyarkhan": {"low": {"latitude": 28.37, "longitude": 70.25}, "high": {"latitude": 28.47, "longitude": 70.37}},
    # Gilgit-Baltistan (added 2026-08-04 for the GB market push). Towns are valley
    # strips, so boxes are generous; expect tens of results, not hundreds.
    "gilgit":     {"low": {"latitude": 35.86, "longitude": 74.24}, "high": {"latitude": 36.00, "longitude": 74.45}},  # city + Jutial + Danyore
    "skardu":     {"low": {"latitude": 35.25, "longitude": 75.50}, "high": {"latitude": 35.36, "longitude": 75.75}},  # town + airport road
    "hunza":      {"low": {"latitude": 36.28, "longitude": 74.55}, "high": {"latitude": 36.37, "longitude": 74.72}},  # Aliabad + Karimabad
    "chilas":     {"low": {"latitude": 35.39, "longitude": 74.05}, "high": {"latitude": 35.45, "longitude": 74.16}},
    "gahkuch":    {"low": {"latitude": 36.14, "longitude": 73.71}, "high": {"latitude": 36.21, "longitude": 73.83}},
    "khaplu":     {"low": {"latitude": 35.12, "longitude": 76.28}, "high": {"latitude": 35.20, "longitude": 76.40}},
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


LEGACY = {"on": False}   # flips on automatically if Places API (New) is blocked on the key


def _curl_json(url, params):
    a = ["curl", "-s", "--max-time", "45", "-G", url]
    for k, v in params.items():
        a += ["--data-urlencode", f"{k}={v}"]
    p = subprocess.run(a, capture_output=True, text=True)
    try:
        return json.loads(p.stdout or "{}")
    except Exception:
        return {"_raw": p.stdout[:300]}


def legacy_search(term, city, box, page_token=None):
    """Places API (legacy) Text Search, normalised to the New-API response shape.
    Used when the key has only the classic 'Places API' enabled. Legacy 'location'
    is a bias, not a restriction, so results are filtered back to the city box."""
    import math
    c_lat = (box["low"]["latitude"] + box["high"]["latitude"]) / 2
    c_lng = (box["low"]["longitude"] + box["high"]["longitude"]) / 2
    span_m = max(
        (box["high"]["latitude"] - box["low"]["latitude"]) * 111_000,
        (box["high"]["longitude"] - box["low"]["longitude"]) * 111_000
        * max(0.2, math.cos(math.radians(c_lat))),
    )
    params = {"key": KEY}
    if page_token:
        params["pagetoken"] = page_token
    else:
        params.update(query=f"{term} in {city}",
                      location=f"{c_lat},{c_lng}",
                      radius=str(min(int(span_m / 2) + 2000, 50_000)))
    r = _curl_json("https://maps.googleapis.com/maps/api/place/textsearch/json", params)
    status = r.get("status", "")
    if status not in ("OK", "ZERO_RESULTS"):
        return {"error": {"message": f"legacy {status}: {r.get('error_message','')}"}}
    places = []
    pad = 0.03
    for res in r.get("results", []):
        loc = ((res.get("geometry") or {}).get("location") or {})
        lat, lng = loc.get("lat"), loc.get("lng")
        if lat is None or not (box["low"]["latitude"] - pad <= lat <= box["high"]["latitude"] + pad
                               and box["low"]["longitude"] - pad <= lng <= box["high"]["longitude"] + pad):
            continue
        places.append({
            "id": res["place_id"],
            "displayName": {"text": res.get("name", "")},
            "formattedAddress": res.get("formatted_address", ""),
            "rating": res.get("rating", ""),
            "userRatingCount": res.get("user_ratings_total", ""),
            "types": res.get("types", []),
            "location": {"latitude": lat, "longitude": lng},
            "businessStatus": res.get("business_status", ""),
        })
    return {"places": places, "nextPageToken": r.get("next_page_token")}


def legacy_details(place_id):
    """Phone + website for one place (legacy Place Details, contact fields)."""
    r = _curl_json("https://maps.googleapis.com/maps/api/place/details/json",
                   {"key": KEY, "place_id": place_id,
                    "fields": "formatted_phone_number,international_phone_number,website"})
    res = r.get("result") or {}
    return {"nationalPhoneNumber": res.get("formatted_phone_number", ""),
            "internationalPhoneNumber": res.get("international_phone_number", ""),
            "websiteUri": res.get("website", "")}


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

    terms = LITHIUM_TERMS if "--lithium" in sys.argv else TERMS
    box, found, calls = CITIES[city], {}, 0
    for term in terms:
        token, page = None, 0
        while page < 3:                      # Places caps Text Search at ~60 results
            if LEGACY["on"]:
                r = legacy_search(term, city, box, token)
            else:
                r = search(term, box, token)
                if "blocked" in ((r.get("error") or {}).get("message") or ""):
                    print("  ! Places API (New) blocked on this key — using legacy Places API")
                    LEGACY["on"] = True
                    r = legacy_search(term, city, box, token)
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

    if LEGACY["on"] and found:
        # Legacy Text Search omits contact fields — one Details call per place.
        print(f"  fetching phones/websites for {len(found)} places (legacy details)…")
        for pid, pl in found.items():
            pl.update(legacy_details(pid))
            calls += 1

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

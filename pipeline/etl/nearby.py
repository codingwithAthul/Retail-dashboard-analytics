"""Pharmacies and supermarkets within a 10-minute walk of each store, from OpenStreetMap.

Places are found with the Nominatim search API (OpenStreetMap), one search per kind
of place around each store, at most one request a second as its usage policy asks.
Run `python -m etl nearby` from the pipeline folder to refresh the app's data file;
the store list is read from Research/data/vancouver-sdm-stores.csv.
"""

from __future__ import annotations

import csv
import json
import math
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

SEARCH = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "retail-dashboard-analytics research script (github.com/codingwithAthul/Retail-dashboard-analytics)"

# About a 10-minute walk.
RADIUS_M = 800
# The store's own pin and its OpenStreetMap point can sit this far apart.
SELF_M = 60
# Two results with the same name this close together are one place (a point and its building outline).
DUPLICATE_M = 40

# Search phrase -> (OpenStreetMap category/type pairs it should return, kind shown in the app)
SEARCHES = {
    "pharmacy": ({("amenity", "pharmacy")}, "Pharmacy"),
    "supermarket": ({("shop", "supermarket")}, "Supermarket"),
}

# Loblaw banners found in Metro Vancouver, matched on the place name.
LOBLAW_BANNERS = [
    ("Shoppers Drug Mart", r"shoppers drug mart|simply pharmacy"),
    ("Loblaw Pharmacy", r"loblaw pharmacy"),
    ("Real Canadian Superstore", r"superstore"),
    ("No Frills", r"no ?frills"),
    ("T&T Supermarket", r"\bt ?& ?t\b"),
    ("Your Independent Grocer", r"independent grocer"),
    ("Loblaws City Market", r"loblaws"),
]

EARTH_M = 6_371_000


def distance_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * EARTH_M * math.asin(math.sqrt(a))


def viewbox(lat: float, lng: float) -> tuple[float, float, float, float]:
    """left, top, right, bottom of a box that holds the search radius, with a small margin."""
    dlat = math.degrees(RADIUS_M * 1.05 / EARTH_M)
    dlng = dlat / math.cos(math.radians(lat))
    return (lng - dlng, lat + dlat, lng + dlng, lat - dlat)


def classify(result: dict) -> tuple[str, str | None] | None:
    """(kind, Loblaw banner or None) for a search result, or None when it is not a pharmacy or supermarket."""
    name = (result.get("name") or "").strip()
    if not name:
        return None
    for types, kind in SEARCHES.values():
        if (result.get("category"), result.get("type")) in types:
            banner = next((b for b, pattern in LOBLAW_BANNERS if re.search(pattern, name, re.IGNORECASE)), None)
            return kind, banner
    return None


def nearby_for_store(store: dict, results: list[dict]) -> list[dict]:
    """Places within the radius of one store, nearest first, without the store itself or duplicates."""
    lat, lng = float(store["lat"]), float(store["lng"])
    found: list[dict] = []
    for r in results:
        kind_banner = classify(r)
        if kind_banner is None:
            continue
        kind, banner = kind_banner
        plat, plng = float(r["lat"]), float(r["lon"])
        d = distance_m(lat, lng, plat, plng)
        if d > RADIUS_M:
            continue
        if banner == "Shoppers Drug Mart" and d <= SELF_M:
            continue
        if any(p["name"] == r["name"] and distance_m(p["coords"][0], p["coords"][1], plat, plng) <= DUPLICATE_M for p in found):
            continue
        found.append(
            {
                "name": r["name"],
                "kind": kind,
                "loblaw": banner,
                "coords": [round(plat, 5), round(plng, 5)],
                "distanceM": round(d),
                "osm": f"{r['osm_type'][0]}{r['osm_id']}",
            }
        )
    return sorted(found, key=lambda p: (p["distanceM"], p["name"]))


def search(phrase: str, box: tuple[float, float, float, float]) -> list[dict]:
    query = urllib.parse.urlencode(
        {"q": phrase, "format": "jsonv2", "limit": 40, "bounded": 1, "viewbox": ",".join(f"{v:.5f}" for v in box)}
    )
    request = urllib.request.Request(f"{SEARCH}?{query}", headers={"User-Agent": USER_AGENT})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                results = json.loads(response.read().decode("utf-8"))
            if len(results) >= 40:
                print(f"warning: 40 results for '{phrase}' near {box}; some places may be missing")
            return results
        except OSError:
            if attempt == 3:
                raise
            time.sleep(2 ** (attempt + 1))
    raise AssertionError("unreachable")


def write_nearby(stores: dict[str, list[dict]], out: Path) -> None:
    data = {
        "radiusM": RADIUS_M,
        "source": "OpenStreetMap contributors, found with Nominatim search",
        "stores": {sid: stores[sid] for sid in sorted(stores, key=lambda s: int(s) if s.isdigit() else s)},
    }
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def build(stores_csv: Path, out: Path, pause: float = 1.1) -> dict[str, list[dict]]:
    with stores_csv.open(newline="") as f:
        stores = list(csv.DictReader(f))
    result = {}
    for store in stores:
        box = viewbox(float(store["lat"]), float(store["lng"]))
        places: list[dict] = []
        for phrase in SEARCHES:
            places += search(phrase, box)
            time.sleep(pause)
        result[store["store_number"]] = nearby_for_store(store, places)
    write_nearby(result, out)
    return result

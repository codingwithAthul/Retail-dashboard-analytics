"""2021 census profiles for the postal areas (forward sortation areas, FSAs) that hold each store.

Values come from the Statistics Canada Census Profile SDMX API, which serves the same
tables as the Census Profile web pages. Run `python -m etl census` from the pipeline
folder to refresh the app's data file; the store list is read from
Research/data/vancouver-sdm-stores.csv.
"""

from __future__ import annotations

import csv
import io
import json
import time
import urllib.request
from pathlib import Path

API = "https://api.statcan.gc.ca/census-recensement/profile/sdmx/rest/data/STC_CP,DF_FSA/A5.2021A0011{fsa}.1..?format=csv"
PAGE = "https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/details/page.cfm?Lang=E&DGUIDlist=2021A0011{fsa}&GENDERlist=1&STATISTIClist=1,4&HEADERlist=0"

# (field, characteristic code, statistic: 1 = count or value, 4 = rate)
MEASURES = [
    ("population", 1, 1),
    ("medianAge", 40, 1),
    ("medianHouseholdIncome", 229, 1),
    ("renters", 1402, 4),
    ("immigrants", 1515, 4),
    ("nonPermanentResidents", 1523, 4),
    ("lowIncome", 331, 4),
]

# Age bands built from the five-year groups, matching the UBC census card.
AGE_BANDS = [
    ("0–14", [9]),
    ("15–24", [14, 15]),
    ("25–44", [16, 17, 18, 19]),
    ("45–64", [20, 21, 22, 23]),
    ("65+", [24]),
]
AGE_TOTAL = 8


def fsa_of(postal_code: str) -> str:
    return postal_code.replace(" ", "").upper()[:3]


def _number(text: str | None) -> float | int | None:
    if text is None or text.strip() == "":
        return None
    value = float(text)
    return int(value) if value.is_integer() else value


def area_profile(rows: list[dict]) -> dict:
    """Pick the dashboard's measures out of one area's profile rows (total gender only)."""
    values: dict[tuple[int, int], float | int | None] = {}
    for r in rows:
        if r["GENDER"] != "1":
            continue
        values[(int(r["CHARACTERISTIC"]), int(r["STATISTIC"]))] = _number(r["OBS_VALUE"])
    profile: dict = {field: values.get((code, stat)) for field, code, stat in MEASURES}
    bands = []
    for name, codes in AGE_BANDS:
        parts = [values.get((c, 1)) for c in codes]
        bands.append({"name": name, "count": None if None in parts else int(sum(parts))})
    profile["ageBands"] = bands
    profile["ageTotal"] = values.get((AGE_TOTAL, 1))
    return profile


def fetch_rows(fsa: str, tries: int = 4) -> list[dict]:
    """Download one postal area's profile, retrying dropped connections with growing waits."""
    request = urllib.request.Request(API.format(fsa=fsa), headers={"User-Agent": "retail-dashboard-analytics census script"})
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                return list(csv.DictReader(io.StringIO(response.read().decode("utf-8"))))
        except OSError:
            if attempt == tries - 1:
                raise
            time.sleep(2 ** (attempt + 1))
    raise AssertionError("unreachable")


def store_fsas(stores_csv: Path) -> list[str]:
    with stores_csv.open(newline="") as f:
        return sorted({fsa_of(r["postal_code"]) for r in csv.DictReader(f)})


def write_census(areas: dict[str, dict], out: Path) -> None:
    data = {
        "year": 2021,
        "source": "Statistics Canada, Census Profile, 2021 Census of Population, forward sortation areas",
        "page": PAGE,
        "areas": {fsa: areas[fsa] for fsa in sorted(areas)},
    }
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def build(stores_csv: Path, out: Path, pause: float = 1.0) -> dict[str, dict]:
    areas = {}
    for fsa in store_fsas(stores_csv):
        areas[fsa] = area_profile(fetch_rows(fsa))
        time.sleep(pause)
    write_census(areas, out)
    return areas

import json

import pytest

from etl.census import AGE_BANDS, area_profile, fsa_of, write_census


def row(char, stat, value, gender="1"):
    return {"CHARACTERISTIC": str(char), "STATISTIC": str(stat), "GENDER": gender, "OBS_VALUE": value}


@pytest.fixture
def rows():
    counts = {8: 1000, 9: 100, 14: 50, 15: 150, 16: 100, 17: 100, 18: 50, 19: 50, 20: 50, 21: 50, 22: 50, 23: 50, 24: 200}
    out = [row(c, 1, str(v)) for c, v in counts.items()]
    out += [
        row(1, 1, "1002"),
        row(40, 1, "38.4"),
        row(229, 1, "71000"),
        row(1402, 4, "61.2"),
        row(1515, 4, "40.0"),
        row(1523, 4, "7.5"),
        row(331, 4, "12.0"),
        # Other genders and statistics are ignored.
        row(1, 1, "500", gender="2"),
        row(229, 4, "99999"),
    ]
    return out


def test_fsa_of_reads_the_first_three_characters():
    assert fsa_of("V6G 2M5") == "V6G"
    assert fsa_of("v5s4w2") == "V5S"


def test_area_profile_picks_totals_and_rates(rows):
    p = area_profile(rows)
    assert p["population"] == 1002
    assert p["medianAge"] == 38.4
    assert p["medianHouseholdIncome"] == 71000
    assert p["renters"] == 61.2
    assert p["immigrants"] == 40.0
    assert p["nonPermanentResidents"] == 7.5
    assert p["lowIncome"] == 12.0


def test_age_bands_sum_single_years_and_share_the_total(rows):
    p = area_profile(rows)
    assert [b["name"] for b in p["ageBands"]] == [name for name, _ in AGE_BANDS]
    assert [b["count"] for b in p["ageBands"]] == [100, 200, 300, 200, 200]
    assert p["ageTotal"] == 1000


def test_missing_values_become_none(rows):
    p = area_profile([r for r in rows if r["CHARACTERISTIC"] != "331"])
    assert p["lowIncome"] is None


def test_write_census_is_sorted_and_stable(tmp_path, rows):
    out = tmp_path / "census.json"
    write_census({"V6G": area_profile(rows), "V5K": area_profile(rows)}, out)
    data = json.loads(out.read_text())
    assert list(data["areas"]) == ["V5K", "V6G"]
    assert data["year"] == 2021

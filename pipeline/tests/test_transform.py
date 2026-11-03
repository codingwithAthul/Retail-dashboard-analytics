import json
from datetime import date

import pandas as pd
import pytest

from etl.generate import generate
from etl.transform import academic_term, build_dim_date, full_months, transform, write_summary
from etl.validate import validate


@pytest.fixture(scope="module")
def tables(tmp_path_factory):
    out = tmp_path_factory.mktemp("raw")
    generate(out)
    report = validate(out)
    assert report.ok
    return report.tables


@pytest.fixture(scope="module")
def summary(tables):
    return transform(tables, "sample")


def ttm_mask(tables, store_id):
    sales = tables["fact_sales"]
    return (sales["store_id"] == store_id) & (sales["date"] >= pd.Timestamp("2025-11-01"))


def test_academic_terms():
    assert [academic_term(m) for m in (1, 4, 5, 8, 9, 12)] == [
        "Winter T2", "Winter T2", "Summer", "Summer", "Winter T1", "Winter T1",
    ]


def test_dim_date_has_every_day_and_flags_weekends():
    dim = build_dim_date(pd.Series(pd.to_datetime(["2026-01-03", "2025-12-30"])))
    assert dim["date"].dt.strftime("%m-%d").tolist() == ["12-30", "12-31", "01-01", "01-02", "01-03"]
    assert dim["is_weekend"].tolist() == [0, 0, 0, 0, 1]
    assert dim["month_key"].tolist()[-1] == "2026-01"


def test_partial_first_and_last_months_are_dropped():
    dim = build_dim_date(pd.Series(pd.to_datetime(["2026-01-15", "2026-04-10"])))
    assert full_months(dim) == ["2026-02", "2026-03"]


def test_period_and_shape(summary):
    assert summary["source"] == "sample"
    assert summary["period"] == {"start": "2024-11", "end": "2026-10"}
    assert set(summary["stores"]) == {"2247", "2273"}
    for store in summary["stores"].values():
        assert len(store["months"]) == 24
        assert len(store["topItems"]) == 8
        assert [d["day"] for d in store["weekdays"]] == ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


@pytest.mark.parametrize("store_id", ["2247", "2273"])
def test_monthly_totals_reconcile_with_facts(tables, summary, store_id):
    sales = tables["fact_sales"]
    traffic = tables["fact_traffic"]
    months = summary["stores"][store_id]["months"]
    assert sum(m["sales"] for m in months) == pytest.approx(sales.loc[sales["store_id"] == store_id, "net_sales"].sum(), abs=24)
    assert sum(m["transactions"] for m in months) == traffic.loc[traffic["store_id"] == store_id, "transactions"].sum()


@pytest.mark.parametrize("store_id", ["2247", "2273"])
def test_category_totals_reconcile_with_last_twelve_months(tables, summary, store_id):
    store = summary["stores"][store_id]
    ttm_sales = sum(m["sales"] for m in store["months"][-12:])
    assert sum(c["sales"] for c in store["categories"]) == pytest.approx(ttm_sales, abs=12)
    assert sum(c["share"] for c in store["categories"]) == pytest.approx(1, abs=0.001)
    expected = tables["fact_sales"].loc[ttm_mask(tables, store_id), "net_sales"].sum()
    assert ttm_sales == pytest.approx(expected, abs=12)


def test_categories_are_largest_first(summary):
    for store in summary["stores"].values():
        sales = [c["sales"] for c in store["categories"]]
        assert sales == sorted(sales, reverse=True)


def test_top_items_exclude_prescriptions_and_rank_by_units(summary):
    for store in summary["stores"].values():
        assert all(i["category"] != "Pharmacy" for i in store["topItems"])
        units = [i["units"] for i in store["topItems"]]
        assert units == sorted(units, reverse=True)


def test_pharmacy_share_matches_category(summary):
    for store in summary["stores"].values():
        pharmacy = next(c for c in store["categories"] if c["category"] == "Pharmacy")
        assert store["pharmacyShare"] == pytest.approx(pharmacy["share"], abs=0.0001)


def test_campus_store_is_busiest_on_weekdays(summary):
    days = {d["day"]: d["averageSales"] for d in summary["stores"]["2273"]["weekdays"]}
    assert min(days["Mon"], days["Tue"], days["Wed"]) > max(days["Sat"], days["Sun"])


def test_needs_a_year_of_data(tables):
    short = dict(tables)
    for name in ("fact_sales", "fact_traffic"):
        df = tables[name]
        short[name] = df[df["date"] < pd.Timestamp(date(2025, 6, 1))]
    with pytest.raises(ValueError, match="at least 12 full months"):
        transform(short, "sample")


def test_written_file_is_stable_json(summary, tmp_path):
    path = tmp_path / "sales.json"
    write_summary(summary, path)
    first = path.read_bytes()
    write_summary(json.loads(first), path)
    assert path.read_bytes() == first
    assert first.endswith(b"\n")

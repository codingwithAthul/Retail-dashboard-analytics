from pathlib import Path

import pandas as pd
import pytest

from etl.generate import SAMPLE_END, SAMPLE_START, generate, generate_store, load_reference
from etl.io import read_table
from etl.profiles import PROFILES
from etl.schema import TABLES


@pytest.fixture(scope="module")
def raw(tmp_path_factory) -> Path:
    out = tmp_path_factory.mktemp("raw")
    generate(out)
    return out


@pytest.fixture(scope="module")
def sales(raw):
    return read_table(raw / "fact_sales.csv", TABLES["fact_sales"])


@pytest.fixture(scope="module")
def traffic(raw):
    return read_table(raw / "fact_traffic.csv", TABLES["fact_traffic"])


def test_writes_every_input_table(raw):
    assert sorted(p.stem for p in raw.glob("*.csv")) == sorted(
        ["dim_store", "dim_category", "dim_product", "fact_sales", "fact_traffic"]
    )


def test_same_seed_gives_same_data(tmp_path, raw):
    generate(tmp_path)
    for name in ("fact_sales", "fact_traffic"):
        assert (tmp_path / f"{name}.csv").read_bytes() == (raw / f"{name}.csv").read_bytes()


def test_covers_two_full_years_for_both_stores(traffic):
    for _, days in traffic.groupby("store_id"):
        assert days["date"].min() == pd.Timestamp(SAMPLE_START)
        assert days["date"].max() == pd.Timestamp(SAMPLE_END)
        assert len(days) == (SAMPLE_END - SAMPLE_START).days + 1


def test_only_rows_with_sales_are_exported(sales):
    assert (sales["units"] > 0).all()
    assert (sales["net_sales"] > 0).all()


def test_stores_without_prestige_beauty_never_sell_it(sales):
    prestige = {"P009", "P010"}
    sold_at_ubc = set(sales.loc[sales["store_id"] == "2273", "product_id"])
    assert not prestige & sold_at_ubc


@pytest.mark.parametrize("store_id", list(PROFILES))
def test_average_basket_follows_profile(sales, traffic, store_id):
    basket = sales.loc[sales["store_id"] == store_id, "net_sales"].sum() / traffic.loc[
        traffic["store_id"] == store_id, "transactions"
    ].sum()
    assert basket == pytest.approx(PROFILES[store_id].average_basket, rel=0.03)


@pytest.mark.parametrize("store_id", list(PROFILES))
def test_category_mix_follows_profile(store_id):
    ref = load_reference()
    sales, _ = generate_store(PROFILES[store_id], ref, SAMPLE_START, SAMPLE_END)
    named = sales.merge(ref["dim_product"], on="product_id").merge(ref["dim_category"], on="category_id")
    share = named.groupby("category_name")["net_sales"].sum() / named["net_sales"].sum()
    for category, expected in PROFILES[store_id].mix.items():
        assert share[category] == pytest.approx(expected, abs=0.01)


@pytest.mark.parametrize("store_id", list(PROFILES))
def test_year_over_year_growth_follows_profile(sales, store_id):
    store = sales[sales["store_id"] == store_id]
    split = pd.Timestamp(SAMPLE_START) + pd.DateOffset(years=1)
    prior = store.loc[store["date"] < split, "net_sales"].sum()
    latest = store.loc[store["date"] >= split, "net_sales"].sum()
    assert latest / prior - 1 == pytest.approx(PROFILES[store_id].growth, abs=0.015)


def test_campus_store_dips_in_summer(sales):
    ubc = sales[sales["store_id"] == "2273"]
    by_month = ubc.groupby(ubc["date"].dt.month)["net_sales"].sum()
    assert by_month[7] < 0.7 * by_month[9]

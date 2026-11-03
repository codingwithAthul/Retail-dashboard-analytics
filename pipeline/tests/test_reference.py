from pathlib import Path

import pytest

from etl.io import read_table
from etl.schema import TABLES

REFERENCE = Path(__file__).parent.parent / "reference"
REFERENCE_TABLES = ["dim_store", "dim_category", "dim_product"]


@pytest.fixture(scope="module")
def frames():
    return {name: read_table(REFERENCE / f"{name}.csv", TABLES[name]) for name in REFERENCE_TABLES}


@pytest.mark.parametrize("name", REFERENCE_TABLES)
def test_columns_match_schema(frames, name):
    assert list(frames[name].columns) == TABLES[name].column_names


@pytest.mark.parametrize("name", REFERENCE_TABLES)
def test_primary_key_is_unique_and_present(frames, name):
    key = list(TABLES[name].primary_key)
    df = frames[name]
    assert df[key].notna().all().all()
    assert not df.duplicated(key).any()


def test_store_ids_stay_text(frames):
    assert frames["dim_store"]["store_id"].tolist() == ["2247", "2273"]


def test_every_product_has_a_known_category(frames):
    known = set(frames["dim_category"]["category_id"])
    assert set(frames["dim_product"]["category_id"]) <= known


def test_prices_are_positive(frames):
    assert (frames["dim_product"]["unit_price"] > 0).all()


def test_category_names_match_the_app():
    # Keep in step with the Category type in src/data/types.ts.
    app_categories = {
        "Pharmacy", "OTC health", "Beauty", "Personal care",
        "Convenience food", "Fresh grocery", "Household", "Seasonal",
    }
    df = read_table(REFERENCE / "dim_category.csv", TABLES["dim_category"])
    assert set(df["category_name"]) == app_categories


def test_foreign_keys_point_at_real_columns():
    for table in TABLES.values():
        for col in table.columns:
            if col.references:
                target, column = col.references.split(".")
                assert column in TABLES[target].column_names

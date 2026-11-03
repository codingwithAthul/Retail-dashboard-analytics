import shutil
from pathlib import Path

import pandas as pd
import pytest

from etl.generate import generate
from etl.validate import validate


@pytest.fixture(scope="module")
def clean(tmp_path_factory) -> Path:
    out = tmp_path_factory.mktemp("clean")
    generate(out)
    return out


@pytest.fixture
def raw(clean, tmp_path) -> Path:
    """A fresh copy of valid data that a test can break."""
    shutil.copytree(clean, tmp_path, dirs_exist_ok=True)
    return tmp_path


def edit(folder: Path, name: str, change) -> None:
    path = folder / f"{name}.csv"
    df = pd.read_csv(path, dtype=str, keep_default_na=False)
    result = change(df)  # edits in place, or returns a new frame
    (df if result is None else result).to_csv(path, index=False)


def errors_for(folder: Path) -> str:
    report = validate(folder)
    assert not report.ok
    return "\n".join(report.errors)


def test_generated_data_is_valid(clean):
    report = validate(clean)
    assert report.ok, report.errors
    assert report.warnings == []
    assert set(report.tables) == {"dim_store", "dim_category", "dim_product", "fact_sales", "fact_traffic"}


def test_missing_file(raw):
    (raw / "fact_traffic.csv").unlink()
    assert "fact_traffic.csv is missing" in errors_for(raw)


def test_missing_column(raw):
    edit(raw, "fact_sales", lambda df: df.drop(columns="units"))
    assert "fact_sales.csv is missing column(s): units" in errors_for(raw)


def test_extra_columns_are_ignored(raw):
    edit(raw, "dim_store", lambda df: df.insert(len(df.columns), "region", "BC"))
    assert validate(raw).ok


def test_bad_date(raw):
    edit(raw, "fact_sales", lambda df: df.loc.__setitem__((0, "date"), "2025-02-30"))
    assert "fact_sales.date: 1 value(s) are not a valid date" in errors_for(raw)


def test_text_in_number_column(raw):
    edit(raw, "fact_sales", lambda df: df.loc.__setitem__((0, "net_sales"), "twelve"))
    assert "fact_sales.net_sales: 1 value(s) are not a valid float" in errors_for(raw)


def test_fractional_units(raw):
    edit(raw, "fact_sales", lambda df: df.loc.__setitem__((0, "units"), "1.5"))
    assert "fact_sales.units: 1 value(s) are not whole numbers" in errors_for(raw)


def test_empty_required_value(raw):
    edit(raw, "dim_product", lambda df: df.loc.__setitem__((0, "product_name"), ""))
    assert "dim_product.product_name: 1 empty value(s)" in errors_for(raw)


def test_negative_units(raw):
    edit(raw, "fact_sales", lambda df: df.loc.__setitem__((0, "units"), "-3"))
    assert "fact_sales.units: 1 value(s) below 0" in errors_for(raw)


def test_duplicate_key(raw):
    edit(raw, "fact_traffic", lambda df: df.loc.__setitem__(1, df.loc[0]))
    assert "fact_traffic: 1 duplicate row(s) for key (date, store_id)" in errors_for(raw)


def test_unknown_product(raw):
    edit(raw, "fact_sales", lambda df: df.loc.__setitem__((0, "product_id"), "P999"))
    assert "fact_sales.product_id: 1 value(s) not in dim_product, e.g. P999" in errors_for(raw)


def test_store_ids_keep_leading_zeros(raw):
    edit(raw, "dim_store", lambda df: df.loc.__setitem__((0, "store_id"), "02247"))
    assert "fact_sales.store_id: 1 value(s) not in dim_store, e.g. 2247" in errors_for(raw)


def test_sales_without_traffic(raw):
    edit(raw, "fact_traffic", lambda df: df.drop(index=0))
    assert "1 store-day(s) have sales but no transaction count" in errors_for(raw)


def test_sales_with_zero_transactions(raw):
    edit(raw, "fact_traffic", lambda df: df.loc.__setitem__((0, "transactions"), "0"))
    assert "1 store-day(s) have sales but zero transactions" in errors_for(raw)


def test_price_above_shelf_is_a_warning(raw):
    edit(raw, "fact_sales", lambda df: df.loc.__setitem__((0, "net_sales"), "99999"))
    report = validate(raw)
    assert report.ok
    assert any("sold above shelf price" in w for w in report.warnings)


def test_department_must_be_pharmacy_or_front_store(raw):
    edit(raw, "dim_category", lambda df: df.loc.__setitem__((1, "department"), "Front Store"))
    assert "dim_category.department: 'Front Store' not allowed; use Pharmacy or Front store" in errors_for(raw)

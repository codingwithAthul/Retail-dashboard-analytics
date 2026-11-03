"""Check raw input tables before anything is built from them.

Errors stop the pipeline. Warnings are printed but do not stop it, because real exports
can have legitimate oddities (for example a price change mid-period).
"""

from dataclasses import dataclass, field
from pathlib import Path

import pandas as pd

from .schema import INPUT_TABLES, TABLES, Table

PRICE_TOLERANCE = 1.25  # net sales above units × price × this are suspicious
MIN_BASKET, MAX_BASKET = 1.0, 500.0  # plausible average basket per store-day, CAD


@dataclass
class Report:
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    tables: dict[str, pd.DataFrame] = field(default_factory=dict)

    @property
    def ok(self) -> bool:
        return not self.errors


def _coerce(raw: pd.DataFrame, table: Table, report: Report) -> pd.DataFrame:
    """Convert text columns to their schema types, reporting values that do not convert."""
    df = pd.DataFrame(index=raw.index)
    for col in table.columns:
        values = raw[col.name].str.strip()
        if col.dtype == "str":
            df[col.name] = values.astype("string")
            continue
        if col.dtype == "date":
            parsed = pd.to_datetime(values, format="%Y-%m-%d", errors="coerce")
        else:
            parsed = pd.to_numeric(values, errors="coerce")
        bad = values.notna() & parsed.isna()
        if bad.any():
            report.errors.append(
                f"{table.name}.{col.name}: {bad.sum()} value(s) are not a valid {col.dtype}, e.g. {values[bad].iloc[0]!r}"
            )
        if col.dtype == "int":
            fractional = parsed.notna() & (parsed % 1 != 0)
            if fractional.any():
                report.errors.append(f"{table.name}.{col.name}: {fractional.sum()} value(s) are not whole numbers")
            parsed = parsed.round().astype("Int64")
        elif col.dtype == "float":
            parsed = parsed.astype("Float64")
        df[col.name] = parsed
    return df


def _check_table(df: pd.DataFrame, table: Table, report: Report) -> None:
    for col in table.columns:
        nulls = df[col.name].isna().sum()
        if nulls and not col.nullable:
            report.errors.append(f"{table.name}.{col.name}: {nulls} empty value(s)")
        if col.min_value is not None:
            below = (df[col.name] < col.min_value).sum()
            if below:
                report.errors.append(f"{table.name}.{col.name}: {below} value(s) below {col.min_value}")
    dupes = df.duplicated(list(table.primary_key)).sum()
    if dupes:
        report.errors.append(f"{table.name}: {dupes} duplicate row(s) for key ({', '.join(table.primary_key)})")


def _check_references(report: Report) -> None:
    for table in (TABLES[n] for n in INPUT_TABLES):
        for col in table.columns:
            if not col.references:
                continue
            target, key = col.references.split(".")
            known = set(report.tables[target][key].dropna())
            unknown = set(report.tables[table.name][col.name].dropna()) - known
            if unknown:
                sample = ", ".join(sorted(unknown)[:3])
                report.errors.append(f"{table.name}.{col.name}: {len(unknown)} value(s) not in {target}, e.g. {sample}")


def _check_facts(report: Report) -> None:
    sales, traffic, products = (report.tables[n] for n in ("fact_sales", "fact_traffic", "dim_product"))

    daily = sales.groupby(["date", "store_id"], as_index=False)["net_sales"].sum()
    joined = daily.merge(traffic, on=["date", "store_id"], how="left")
    missing = joined["transactions"].isna().sum()
    if missing:
        report.errors.append(f"fact_traffic: {missing} store-day(s) have sales but no transaction count")
    with_traffic = joined[joined["transactions"].fillna(0) > 0]
    basket = with_traffic["net_sales"] / with_traffic["transactions"]
    odd = ((basket < MIN_BASKET) | (basket > MAX_BASKET)).sum()
    if odd:
        report.warnings.append(
            f"{odd} store-day(s) have an average basket outside ${MIN_BASKET:.0f}–${MAX_BASKET:.0f}"
        )
    zero = (joined["transactions"] == 0).sum()
    if zero:
        report.errors.append(f"fact_traffic: {zero} store-day(s) have sales but zero transactions")

    priced = sales.merge(products[["product_id", "unit_price"]], on="product_id")
    over = (priced["net_sales"] > priced["units"] * priced["unit_price"] * PRICE_TOLERANCE + 0.01).sum()
    if over:
        report.warnings.append(f"fact_sales: {over} row(s) sold above shelf price; check dim_product prices")


def validate(folder: Path) -> Report:
    """Validate every input table in `folder`. Returns typed tables in the report when there are no errors."""
    report = Report()
    for name in INPUT_TABLES:
        table = TABLES[name]
        path = folder / f"{name}.csv"
        if not path.exists():
            report.errors.append(f"{name}.csv is missing from {folder}")
            continue
        raw = pd.read_csv(path, dtype=str, keep_default_na=False, na_values=[""])
        missing = [c for c in table.column_names if c not in raw.columns]
        if missing:
            report.errors.append(f"{name}.csv is missing column(s): {', '.join(missing)}")
            continue
        df = _coerce(raw, table, report)
        _check_table(df, table, report)
        report.tables[name] = df

    if report.ok:
        _check_references(report)
    if report.ok:
        _check_facts(report)
    return report

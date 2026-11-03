"""Read and write schema tables as CSV with the right column types."""

from pathlib import Path

import pandas as pd

from .schema import Table

PANDAS_TYPES = {"str": "string", "int": "Int64", "float": "Float64"}


def read_table(path: Path, table: Table) -> pd.DataFrame:
    """Read a CSV for `table`. IDs stay text (so "0042" keeps its zeros); dates are parsed."""
    dtypes = {c.name: PANDAS_TYPES[c.dtype] for c in table.columns if c.dtype in PANDAS_TYPES}
    dates = [c.name for c in table.columns if c.dtype == "date"]
    return pd.read_csv(path, dtype=dtypes, parse_dates=dates)


def write_table(df: pd.DataFrame, path: Path, table: Table) -> None:
    """Write `df` with the table's columns in schema order."""
    path.parent.mkdir(parents=True, exist_ok=True)
    df[table.column_names].to_csv(path, index=False, date_format="%Y-%m-%d")

"""Turn validated tables into the summary file the dashboard reads."""

import json
from pathlib import Path

import pandas as pd

MONTHS_SHOWN = 24  # trend chart: last 12 months and the 12 before
TOP_ITEMS = 8
WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def academic_term(month: int) -> str:
    if month >= 9:
        return "Winter T1"
    if month <= 4:
        return "Winter T2"
    return "Summer"


def build_dim_date(dates: pd.Series) -> pd.DataFrame:
    """One row per calendar day from the first to the last date in the data."""
    days = pd.date_range(dates.min(), dates.max(), freq="D")
    return pd.DataFrame({
        "date": days,
        "year": days.year,
        "month": days.month,
        "month_key": days.strftime("%Y-%m"),
        "day_of_week": days.day_of_week,
        "is_weekend": (days.day_of_week >= 5).astype(int),
        "academic_term": [academic_term(m) for m in days.month],
    })


def full_months(dim_date: pd.DataFrame) -> list[str]:
    """Months whose every day is in the data, oldest first. A partial first or last month is left out."""
    counts = dim_date.groupby("month_key")["date"].agg(["count", "first"])
    complete = counts["count"] == counts["first"].dt.days_in_month
    return sorted(counts.index[complete])


def store_summary(sales: pd.DataFrame, traffic: pd.DataFrame, months: list[str]) -> dict:
    """Summary for one store. `sales` already carries month_key, day_of_week and category columns."""
    shown = months[-MONTHS_SHOWN:]
    latest = set(months[-12:])

    monthly = (
        sales.groupby("month_key")["net_sales"].sum().to_frame("sales")
        .join(traffic.groupby("month_key")["transactions"].sum())
        .reindex(shown)
        .fillna(0)
    )
    ttm = sales[sales["month_key"].isin(latest)]
    ttm_sales = float(ttm["net_sales"].sum())

    def share(value: float) -> float:
        return round(value / ttm_sales, 4) if ttm_sales else 0.0

    by_category = ttm.groupby("category_name")["net_sales"].sum().sort_values(ascending=False)
    front = ttm[ttm["department"] == "Front store"]
    items = (
        front.groupby(["product_name", "category_name"], as_index=False)
        .agg(units=("units", "sum"), revenue=("net_sales", "sum"))
        .sort_values(["units", "product_name"], ascending=[False, True])
        .head(TOP_ITEMS)
    )
    ttm_days = ttm.groupby(["date", "day_of_week"], as_index=False)["net_sales"].sum()
    by_weekday = ttm_days.groupby("day_of_week")["net_sales"].mean().reindex(range(7), fill_value=0)

    return {
        "months": [
            {"key": key, "sales": round(float(row.sales)), "transactions": int(row.transactions)}
            for key, row in monthly.iterrows()
        ],
        "categories": [
            {"category": name, "sales": round(float(value)), "share": share(float(value))}
            for name, value in by_category.items()
        ],
        "topItems": [
            {"name": r.product_name, "category": r.category_name, "units": int(r.units), "revenue": round(float(r.revenue))}
            for r in items.itertuples()
        ],
        "weekdays": [{"day": WEEKDAYS[d], "averageSales": round(float(v))} for d, v in by_weekday.items()],
        "pharmacyShare": share(float(ttm.loc[ttm["department"] == "Pharmacy", "net_sales"].sum())),
    }


def transform(tables: dict[str, pd.DataFrame], source: str) -> dict:
    """Build the dashboard summary from validated tables. `source` is "sample" or "import"."""
    dim_date = build_dim_date(pd.concat([tables["fact_sales"]["date"], tables["fact_traffic"]["date"]]))
    months = full_months(dim_date)
    if len(months) < 12:
        raise ValueError(f"Need at least 12 full months of data, found {len(months)}")

    calendar = dim_date[["date", "month_key", "day_of_week"]]
    products = tables["dim_product"].merge(tables["dim_category"], on="category_id")
    sales = tables["fact_sales"].merge(calendar, on="date").merge(products, on="product_id")
    traffic = tables["fact_traffic"].merge(calendar, on="date")

    return {
        "source": source,
        "period": {"start": months[-MONTHS_SHOWN:][0], "end": months[-1]},
        "stores": {
            str(store_id): store_summary(sales[sales["store_id"] == store_id], traffic[traffic["store_id"] == store_id], months)
            for store_id in tables["dim_store"]["store_id"]
        },
    }


def write_summary(summary: dict, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

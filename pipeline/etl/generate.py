"""Generate synthetic daily sales that look like a point-of-sale export. Same seed, same data."""

from datetime import date
from pathlib import Path
import shutil

import numpy as np
import pandas as pd

from .io import read_table, write_table
from .profiles import PROFILES, StoreProfile
from .schema import TABLES

REFERENCE = Path(__file__).parent.parent / "reference"

# Two full years ending with the last full month before the research date.
SAMPLE_START = date(2024, 11, 1)
SAMPLE_END = date(2026, 10, 31)

PROMO_SHARE = 0.05  # Share of product-days on promotion
PROMO_DISCOUNT = 0.20
PROMO_LIFT = 1.4  # Unit uplift on promotion days
DAILY_NOISE = 0.06  # Day-to-day variation in store sales
REDUCED_HOURS = {(12, 25): 0.45, (1, 1): 0.7}  # (month, day): sales multiplier


def load_reference() -> dict[str, pd.DataFrame]:
    return {name: read_table(REFERENCE / f"{name}.csv", TABLES[name]) for name in ("dim_store", "dim_category", "dim_product")}


def store_days(profile: StoreProfile, start: date, end: date, rng: np.random.Generator) -> pd.DataFrame:
    """Expected sales for each day: base level × growth trend × month × weekday × holidays × noise."""
    days = pd.DataFrame({"date": pd.date_range(start, end, freq="D")})
    years = (days["date"] - pd.Timestamp(start)).dt.days / 365.25
    trend = (1 + profile.growth) ** years
    season = days["date"].dt.month.map(lambda m: profile.seasonality[m - 1])
    weekday = days["date"].dt.day_of_week.map(lambda d: profile.weekday[d]) / np.mean(profile.weekday)
    holiday = [REDUCED_HOURS.get((d.month, d.day), 1.0) for d in days["date"]]
    noise = rng.lognormal(0, DAILY_NOISE, len(days))
    days["expected_sales"] = profile.base_monthly * 12 / 365.25 * trend * season * weekday * holiday * noise
    return days


def product_shares(profile: StoreProfile, ref: dict[str, pd.DataFrame]) -> pd.DataFrame:
    """Each product's expected share of the store's sales: category mix × weight within category."""
    products = ref["dim_product"].merge(ref["dim_category"], on="category_id")
    products["unit_price"] = products["unit_price"].astype(float)
    products["weight"] = products["product_id"].map(lambda p: profile.product_weights.get(p, 1.0)).astype(float)
    products["category_mix"] = products["category_name"].map(profile.mix).fillna(0.0)
    category_weight = products.groupby("category_id")["weight"].transform("sum")
    products["share"] = (products["category_mix"] * products["weight"] / category_weight).fillna(0.0)
    return products.loc[products["share"] > 0, ["product_id", "unit_price", "share"]]


def generate_store(profile: StoreProfile, ref: dict[str, pd.DataFrame], start: date, end: date) -> tuple[pd.DataFrame, pd.DataFrame]:
    rng = np.random.default_rng(profile.seed)
    days = store_days(profile, start, end, rng)
    rows = days.merge(product_shares(profile, ref), how="cross")

    on_promo = rng.random(len(rows)) < PROMO_SHARE
    price = rows["unit_price"] * np.where(on_promo, 1 - PROMO_DISCOUNT, 1.0)
    expected_units = rows["expected_sales"] * rows["share"] / rows["unit_price"] * np.where(on_promo, PROMO_LIFT, 1.0)
    rows["units"] = rng.poisson(expected_units)
    rows["net_sales"] = (rows["units"] * price).round(2)
    rows["store_id"] = profile.store_id

    sales = rows.loc[rows["units"] > 0, TABLES["fact_sales"].column_names].reset_index(drop=True)

    daily = sales.groupby("date", as_index=False)["net_sales"].sum()
    basket = profile.average_basket * rng.lognormal(0, 0.03, len(daily))
    traffic = pd.DataFrame({
        "date": daily["date"],
        "store_id": profile.store_id,
        "transactions": rng.poisson(daily["net_sales"] / basket),
    })
    return sales, traffic


def generate(out_dir: Path, start: date = SAMPLE_START, end: date = SAMPLE_END) -> None:
    """Write reference tables and synthetic facts for every profiled store to `out_dir`."""
    ref = load_reference()
    results = [generate_store(PROFILES[s], ref, start, end) for s in ref["dim_store"]["store_id"]]
    sales = pd.concat([r[0] for r in results], ignore_index=True)
    traffic = pd.concat([r[1] for r in results], ignore_index=True)

    out_dir.mkdir(parents=True, exist_ok=True)
    for name in ("dim_store", "dim_category", "dim_product"):
        shutil.copyfile(REFERENCE / f"{name}.csv", out_dir / f"{name}.csv")
    write_table(sales, out_dir / "fact_sales.csv", TABLES["fact_sales"])
    write_table(traffic, out_dir / "fact_traffic.csv", TABLES["fact_traffic"])

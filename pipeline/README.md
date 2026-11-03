# Data pipeline

Turns daily store sales into the data file the dashboard reads.

```
raw CSVs ──► validate ──► transform ──► src/data/generated/sales.json ──► dashboard
```

- **Schema:** [`etl/schema.py`](etl/schema.py), documented in [`docs/data-dictionary.md`](../docs/data-dictionary.md)
- **Reference data:** stores, categories and products in [`reference/`](reference)

## Set up

```bash
cd pipeline
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest
```

## Generate sample data

```bash
python -m etl generate          # writes data/raw/*.csv
```

The generator builds two years of daily sales (Nov 2024 to Oct 2026) for each store from the assumptions in [`etl/profiles.py`](etl/profiles.py): monthly seasonality (including UBC's academic calendar), weekday pattern, yearly growth, category mix, product preferences, promotions and reduced holiday hours. It uses a fixed seed, so the output is identical on every run. **This is sample data, not real store sales.**

## Validate

```bash
python -m etl validate          # checks data/raw; --input <folder> for another folder
```

Errors stop the pipeline (exit code 1): missing files or columns, values of the wrong type, empty required values, negative units or sales, duplicate keys, products or stores that are not in the reference tables, and days with sales but no transaction count. Warnings are printed but do not stop it: average baskets outside $1–$500, or sales above shelf price.

## Build the dashboard data

```bash
python -m etl run               # sample data → validate → src/data/generated/sales.json
```

The summary file holds, for each store: 24 months of sales and transactions, last-12-month sales by category, the eight best-selling front-store items by units, average sales by weekday, and the pharmacy share. Only full calendar months are used; a partial first or last month is dropped. At least 12 full months are needed.

## Census by postal area

```bash
python -m etl census            # needs internet → src/data/generated/fsaCensus.json
```

Reads the store table (`Research/data/vancouver-sdm-stores.csv`), takes each store's postal area (the first three characters of its postal code) and downloads its 2021 Census Profile from the Statistics Canada API. Rerun it when stores are added. Method and figures: [Research/09-census-by-postal-area.md](../Research/09-census-by-postal-area.md).

## Nearby pharmacies and supermarkets

```bash
python -m etl nearby            # needs internet → src/data/generated/nearby.json
```

Searches OpenStreetMap (Nominatim, one request a second) for pharmacies and supermarkets within 800 m of each store in the store table, and marks Loblaw banners. Method and limits: [Research/10-nearby-pharmacies-and-supermarkets.md](../Research/10-nearby-pharmacies-and-supermarkets.md).

## Real store data

`python -m etl run --input <folder>` uses real exports instead of sample data. Templates are in [`templates/`](templates); the full guide is [Using real store data](../docs/importing-real-data.md).

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

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

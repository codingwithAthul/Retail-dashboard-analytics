# Using real store data

The dashboard ships with synthetic sample data. To show real figures, export five CSV files from the store systems and run the pipeline on them. No code changes are needed.

## 1. Export five files

Start from the header-only templates in [`pipeline/templates/`](../pipeline/templates). Column meanings are in the [data dictionary](data-dictionary.md).

| File | One row per | Typical source |
|---|---|---|
| `dim_store.csv` | store | store master list |
| `dim_category.csv` | category | merchandise hierarchy |
| `dim_product.csv` | product | item master (regular shelf price) |
| `fact_sales.csv` | store, day and product | point-of-sale daily sales report |
| `fact_traffic.csv` | store and day | point-of-sale transaction count |

Rules the pipeline enforces:

- Dates are `YYYY-MM-DD`. Store and product codes are text, so leading zeros are kept.
- `department` is exactly `Pharmacy` or `Front store`. Prescription sales go in a category with the `Pharmacy` department.
- Every store and product in the facts must exist in the dimension files.
- Every store-day with sales needs a transaction count above zero.
- At least 12 full calendar months. With 24 or more, the dashboard also shows year-over-year change.
- Extra columns are ignored, so exports do not need trimming.

## 2. Run the pipeline

```bash
cd pipeline
python -m etl validate --input path/to/export   # check first; nothing is written
python -m etl run --input path/to/export        # writes src/data/generated/sales.json
```

If anything is wrong, the pipeline stops with an error naming the file, column and an example value, and writes nothing.

## 3. Build the dashboard

```bash
npm run build
```

The "Sample data" notice disappears, because the data file now records that it was imported.

The store codes in the export must match the stores in [`src/data/stores.ts`](../src/data/stores.ts) (2247 and 2273 today). Adding stores to the map is planned for v3.0.

**Privacy:** real sales data should not be committed to a public repository. Run the pipeline and build privately, or keep the export outside the repository and deploy the built site only to an access-controlled host.

# Data dictionary

The dashboard's sales numbers come from a small star schema. Two fact tables hold what happened each day; four dimension tables describe the stores, products, categories and dates.

```
             dim_date
                │
dim_store ── fact_sales ── dim_product ── dim_category
    │
    └─────── fact_traffic ── dim_date
```

The schema is defined in code in [`pipeline/etl/schema.py`](../pipeline/etl/schema.py). A test fails if this page and the code disagree.

## Facts

### fact_sales

Units and net sales per store, day and product. This is the grain of a typical point-of-sale daily export.
Primary key: `date`, `store_id`, `product_id`.

| Column | Type | Description |
|---|---|---|
| `date` | date | Business day. |
| `store_id` | text | Store. Must exist in `dim_store`. |
| `product_id` | text | Product. Must exist in `dim_product`. |
| `units` | integer, ≥ 0 | Units sold. |
| `net_sales` | decimal, ≥ 0 | Sales after discounts, before tax, in CAD. |

### fact_traffic

Customer transactions (receipts) per store and day. Kept separate from `fact_sales` because one receipt holds many products, so transactions cannot be added up from product rows.
Primary key: `date`, `store_id`.

| Column | Type | Description |
|---|---|---|
| `date` | date | Business day. |
| `store_id` | text | Store. Must exist in `dim_store`. |
| `transactions` | integer, ≥ 0 | Number of receipts. |

## Dimensions

### dim_store

| Column | Type | Description |
|---|---|---|
| `store_id` | text | Store number, e.g. 2247. Kept as text so leading zeros are never lost. |
| `store_name` | text | Store name as shown in the dashboard. |
| `banner` | text | Loblaw banner, e.g. Shoppers Drug Mart. |
| `store_format` | text | Store format, e.g. Urban / mixed-use. |
| `city` | text | City. |

### dim_category

| Column | Type | Description |
|---|---|---|
| `category_id` | text | Category code, e.g. C01. |
| `category_name` | text | Category name as shown in the dashboard. |
| `department` | text | Pharmacy or Front store. |

### dim_product

| Column | Type | Description |
|---|---|---|
| `product_id` | text | Product code, e.g. P001. |
| `product_name` | text | Product name. |
| `category_id` | text | Category of the product. Must exist in `dim_category`. |
| `unit_price` | decimal, > 0 | Regular shelf price in CAD. |

### dim_date

Built by the pipeline from the dates in the facts, so it never needs to be supplied.

| Column | Type | Description |
|---|---|---|
| `date` | date | Calendar day. |
| `year` | integer | Calendar year. |
| `month` | integer | Month number, 1 to 12. |
| `month_key` | text | Year and month, YYYY-MM. |
| `day_of_week` | integer | 0 = Monday to 6 = Sunday. |
| `is_weekend` | integer | 1 on Saturday and Sunday, otherwise 0. |
| `academic_term` | text | UBC term: Winter T1 (Sep–Dec), Winter T2 (Jan–Apr) or Summer (May–Aug). |

## Measures used in the dashboard

| Measure | Definition |
|---|---|
| Sales | Sum of `fact_sales.net_sales`. |
| Transactions | Sum of `fact_traffic.transactions`. |
| Average basket | Sales ÷ Transactions. |
| Category share | Category sales ÷ Sales, over the same period. |
| Best-selling items | Front-store products ranked by sum of `units`. Prescriptions are excluded. |
| Year over year | Last 12 full months ÷ the 12 months before, minus 1. |

## Sample data

The data in this repository is **synthetic**. The pipeline generates it from a fixed seed, so every run produces the same numbers. Store exports with the same columns can replace it without code changes.

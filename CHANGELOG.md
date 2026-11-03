# Changelog

## 2.0.0 (2026-11-03)

End-to-end data pipeline: raw daily sales in, dashboard numbers out.

- Python and pandas pipeline in `/pipeline`: generate (or import) → validate → transform → `src/data/generated/sales.json`
- Star schema with daily sales by store and product, daily transactions, and store, product, category and date dimensions; documented in `docs/data-dictionary.md`
- Seeded sample-data generator with seasonality, UBC academic calendar, weekday pattern, growth, promotions and holiday hours
- Validation with clear errors: missing files or columns, wrong types, empty values, negative numbers, duplicate keys, unknown stores or products, days with sales but no transactions
- Real store exports can replace the sample data with no code changes (`python -m etl run --input <folder>`); see `docs/importing-real-data.md`
- The dashboard reads the pipeline's output instead of generating numbers in the browser
- New chart on the Sales tab: average sales by weekday
- CI runs 68 pipeline tests, rebuilds the data and fails if the committed data file is out of date

## 1.1.0 (2026-11-03)

Quality and accessibility release.

- Shareable links: each store and tab has its own address (`#/store/2273/sales`), and Back/Forward work
- "Show data" tables under every chart, for exact values and screen readers
- Map pins are keyboard and screen-reader friendly, with clear names and selected state
- Phone layout: map pins stay visible above the panel, no sideways scrolling, tables scroll inside their card
- End-to-end browser tests (Playwright) on desktop and phone, run in CI alongside 70 unit tests

## 1.0.0 (2026-11-03)

First version, covering SDM #2247 Wesbrook Village and SDM #2273 University of BC.

- Overview map centred on the stores, with selectable pins and a store switcher
- Store panel: summary, format, hours, Key Differentiators, Store Leadership placeholders, pharmacy services
- Demographics tab: estimated segments and age profile, visit drivers, nearby institutions, sourced area facts
- Sales tab (synthetic sample data): KPIs, monthly trend vs last year, category mix, best-selling items
- Competitors tab: nearby competitors, overlap matrix, Compete / Differentiate / Avoid by category
- Apple-style design with light and dark appearance
- Research notes with sources in `/Research`
- CI (type check, 62 unit tests, build) and GitHub Pages deployment

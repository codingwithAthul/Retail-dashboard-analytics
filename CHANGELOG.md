# Changelog

## Unreleased

- **Map key**: a small key at the top right explains the pins: Rx for a profiled store, a ring for a Shoppers Drug Mart store, a numbered ring for stores grouped together (tap to zoom in), and grey for nearby pharmacies and supermarkets when shown. Folded on phones so it does not cover pins
- Grouped stores now look like a larger store ring with a count, instead of a red disc that read like a profiled store

## 2.4.0 (2026-11-09)

The Loblaw overlap view.

- **Network page** (`#/network`, new tab in the top bar): for every store, the other Shoppers Drug Mart stores and sister Loblaw banners within 800 m, nearest first, with how many stores overlap and the closest pair. Downtown's Robson & Burrard, Granville and Yaletown each have three or more other Shoppers within a walk
- Lighthouse also checks the network page

## 2.3.0 (2026-11-03)

Light profiles for the 29 Vancouver directory stores.

- **Census for every Vancouver store**: each directory store's panel shows the 2021 census for its postal area (FSA) next to Metro Vancouver, with residents by age and a link to the Statistics Canada page. Pulled by the new pipeline command `python -m etl census` (`Research/09-census-by-postal-area.md`)
- **Within a 10-minute walk**: each directory store lists the pharmacies and supermarkets within 800 m from OpenStreetMap, with grey pins on the map, Loblaw banners marked, and other Shoppers Drug Mart stores counted. Pulled by `python -m etl nearby` (`Research/10-nearby-pharmacies-and-supermarkets.md`)

## 2.2.0 (2026-11-03)

Map fix, the 2021 census, and the first step of v3.0: every Vancouver store on the map.

- **Map fix**: the base map was blank because CARTO's tile servers now require an API key. The map now uses OpenStreetMap tiles (no key), muted in light appearance and inverted in dark
- **Census**: the Demographics tab shows the Statistics Canada 2021 census for Metro Vancouver A (CSD 5915020, the UBC area) next to Metro Vancouver: population, growth, median age, household income, renters, immigrants, non-permanent residents, low income, and residents by age
- **29 City of Vancouver stores** on the map from public directories, each address checked against the store's own page or a pharmacy directory (`Research/08-vancouver-sdm-stores.md`). Close pins group until you zoom in; a store opened by link is zoomed to
- **Store search** in the top bar: number, name, street, postal code or local area, with keyboard support
- **Directory store panel**: checked address, local area, format, approximate-position note, and the nearest profiled store
- **Compare**: choose the two stores to compare; the pair is kept in the link (`#/compare/2273/2247`)
- Lighthouse also checks a directory store page

## 2.1.0 (2026-11-03)

Store comparison, a printable brief, and an accessibility gate in CI.

- Compare page (`#/compare`): both stores side by side with headline numbers, where each should specialise (categories where one store's share is 3+ points higher), category mix, main customers, weekly rhythm and competitors
- One-page store brief (`#/store/2247/brief`): headline numbers, summary, differentiators, customers, top categories, where to compete, nearby competitors and leadership on a single printable Letter page, with "Print or save as PDF"
- Accessibility: text, badges, KPI changes and links now meet WCAG AA contrast in light and dark; map pins are named by their visible label; source links are underlined
- Lighthouse runs in CI on every page and fails the build if accessibility drops below 100
- Printing always uses the light appearance
- Favicon

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

# Analytics scope and naming decisions

## Decision: keep three analytics tabs

There is enough distinct material for three tabs, and each answers a different head-office question:

| Tab | Question it answers | Data in v1 |
|---|---|---|
| **Demographics** | Who shops here, and why do they come back? | Public research (UBC, census, directories) plus inferred segment shares, labelled as estimates |
| **Sales** | What sells, how much, and is it growing? | **Synthetic sample data**, clearly labelled. Real data would come from the store's point-of-sale and pharmacy systems. |
| **Competitors** | Who nearby sells the same things, and where should this store not fight? | Public directories plus category decisions from [04-competitor-landscape.md](04-competitor-landscape.md) |

Merging them into one tab would bury the sales charts under text, so three tabs stay.

## Tab contents

### Demographics
- Segment shares (estimated): undergraduate, graduate, faculty and staff, neighbourhood residents, visitors.
- Most present and second most present segment.
- Age bands, income tier and international share where public data exists.
- Visit drivers (prescriptions, convenience, beauty) and seasonality.
- Nearby institutions: university buildings, residences, schools.

### Sales (sample data)
- KPI row: trailing 12-month sales, year-over-year change, transactions, average basket.
- Monthly sales line, current year against last year.
- Category mix: Pharmacy, OTC health, Beauty, Personal care, Convenience food, Household, Seasonal.
- Top-selling items with units and revenue.
- Front store versus pharmacy split.
- Seasonality patterns follow each store's customer base (academic calendar on University Blvd, steady residential demand in Wesbrook).

### Competitors
- Map of nearby competitors with distance.
- Overlap matrix: competitor by category.
- Per-category decision: Compete, Differentiate, Avoid, with the reason.

## Naming decisions

| Original label | New label | Reason |
|---|---|---|
| Distinguishables | **Key Differentiators** | Standard business term head-office readers recognise. |
| Personnel (GM, Manager, Assistant Manager) | **Store Leadership**: Associate-Owner, Front Store Manager, Assistant Front Store Manager, Pharmacy Manager | SDM stores are run by a pharmacist Associate-owner, with front store and pharmacy managed separately (role titles To verify with SDM). All fields are empty placeholders. |
| Type of store: Small / Standalone / Large | **Store format**: Conventional, Large format, Urban / mixed-use, Simply Pharmacy | Matches the formats in [02-sdm-store-formats.md](02-sdm-store-formats.md). Both UBC stores are urban, street-level units in mixed-use buildings (Inferred). |
| Demographic / Sales / Local Competitor Analytics | **Demographics / Sales / Competitors** | Shorter tab labels; "analytics" is implied by the dashboard. |
| (app title) | **Store Insights** | Short and neutral; avoids using Loblaw or SDM trademarks as the product name. |

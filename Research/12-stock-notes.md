# Stock notes from the neighbourhood census

Research gathered 2026-11-12. Code: `src/data/stockNotes.ts`. Shown on the **Stock notes** tab of the neighbours panel.

## Why

The **What to stock** tab looks at the shops nearby. **Stock notes** looks at the people nearby. It reads the 2021 census for the store's area and turns each clear difference from Metro Vancouver into a short note on what to stock.

## Rules

A note fires only when the area clearly differs from the Vancouver CMA. The CMA figures are median age 40.8, median household income $90,000, 37.8% of households rent, 41.8% immigrants, 5.1% non-permanent residents and 11.1% low income (LIM-AT). Every note shows the figure behind it.

| Note | Fires when | Suggests | Categories |
|---|---|---|---|
| Older than Metro | Median age is 3 or more years above Metro | Home health care, mobility and incontinence aids, vitamins, medication reviews, blister packs | Pharmacy, OTC health |
| Younger than Metro | Median age is 3 or more years below Metro | Trend beauty, skin care, sexual health, grab-and-go | Beauty, Personal care, Convenience food |
| Most households rent | The renter share is 15 points or more above Metro | Smaller pack sizes, top-up household basics | Household |
| Higher income than Metro | Median household income is at least 125% of Metro's | Prestige beauty, premium vitamins and natural health | Beauty, OTC health |
| Lower income than Metro | Median household income is at most 80% of Metro's, or the low-income share is 5 points or more above Metro | Life Brand and no name lines, PC Optimum offers, the flyer | Personal care, Household, OTC health |
| Many residents born outside Canada | The immigrant share is 8 points or more above Metro | International foods and beauty brands, multilingual pharmacy service | Beauty, Convenience food, Pharmacy |
| Many students and temporary residents | The non-permanent resident share is 4 points or more above Metro | Travel sizes, new-home starter kits, phone and transit cards, late hours | Personal care, Household, Convenience food |

The thresholds are set so that a note marks a real difference, not noise. Nine of the 29 Vancouver stores get no note at all.

## Limits

- **Inferred**: the notes are rules of thumb that link census figures to common pharmacy-retail practice. They are not sales results, and they should be checked against store sales before they change a planogram.
- **Area mismatch**: a postal area (FSA) is wider than a walk-in trade area and counts residents, not shoppers. Downtown stores also serve commuters and visitors whom the census does not count.
- **Household income**: median household income is lower where many people live alone, as in the West End and downtown, so "Lower income" there partly reflects household size.

## Sources

- Statistics Canada, Census Profile, 2021 Census of Population: Vancouver CMA (933) and each postal area; see [09](09-census-by-postal-area.md).
- Metro Vancouver A (UBC) for the two profiled stores; see [07](07-census-2021-ubc.md).

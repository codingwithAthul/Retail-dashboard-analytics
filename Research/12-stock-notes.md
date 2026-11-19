# Stock notes from the neighbourhood census

Research gathered 2026-11-12, rewritten 2026-11-14. Code: `src/data/stockNotes.ts`. Shown on the **Stock notes** tab of the neighbours panel, under "Who lives here, and what it means".

## Why

The **What to stock** tab looks at the shops nearby. **Stock notes** looks at the people nearby. Each note does three things:

1. Names what sets the area apart, in a few words ("Mostly people living alone").
2. States the local figure next to Metro Vancouver's, as a sentence ("57.2% of households are one person, against 29.0% across Metro Vancouver").
3. Makes one call a store manager can act on ("Sell small sizes ... Bulk packs will sit on the shelf").

The first version only listed differences past a threshold and printed "Close to the Metro Vancouver average on every measure checked" for the rest. That read as filler and told the reader nothing, so every store now gets a conclusion with its numbers.

## Data

2021 census, per postal area (FSA), from the Statistics Canada Census Profile API (`pipeline/etl/census.py`). Added in this rewrite: one-person households (characteristic 51), households with children (103), average household size (56), neither English nor French (373), a non-official language at home (726), and the share speaking each of 12 common languages most often at home (Mandarin 1014, Cantonese 1018, Punjabi 949, Tagalog 865, Korean 975, Persian 962, Spanish 971, Vietnamese 847, Hindi 940, Russian 898, Arabic 835, Japanese 974). Shares of residents under 15 and 65+ come from the age bands already in the data.

Metro Vancouver (Vancouver CMA 933): median age 40.8, median household income $90,000, 17.4% aged 65+, 14.1% under 15, 29.0% one-person households, 25.3% households with children, 37.8% rent, 11.1% low income (LIM-AT), 5.1% non-permanent residents, 5.4% speak neither English nor French; Mandarin 5.8%, Punjabi 5.2% and Cantonese 5.0% at home.

## Rules

| Note | Fires when | Call | Categories |
|---|---|---|---|
| Older than most of Vancouver | 65+ share is 4 points or more above Metro | Full bay of home health care, incontinence and mobility aids next to the pharmacy (medication reviews moved to the services call below) | Pharmacy, OTC health |
| Younger than most of Vancouver | Median age is 3 or more years below Metro | More facings for skin care, Quo Beauty and trend cosmetics, sexual health, cold drinks; fewer for home health care | Beauty, Personal care, Convenience food |
| A family neighbourhood | Households with children are 5 points or more above Metro | Diapers, formula and children's cold and fever medicine at full depth; lunch-box snacks | Personal care, OTC health, Convenience food |
| Few children | Under-15 share is 5 points or more below Metro (and the family rule did not fire) | Cut baby care to the basics; give the space to adult personal care | Personal care |
| Mostly people living alone | One-person households are 10 points or more above Metro | Small sizes, single-serve meals; bulk packs will sit | Household, Convenience food |
| Higher incomes | Median household income is at least 125% of Metro's | More space for prestige beauty, premium vitamins, natural health | Beauty, OTC health |
| Price matters here | Low-income share is 5 points or more above Metro, or household income is at most 80% of Metro's where most people do not live alone | Lead with Life Brand and no name, flyer deals and PC Optimum points offers up front | Personal care, Household, OTC health |
| Many speak [language] at home | The top home language is spoken by 8% or more of residents and at least twice its Metro share | A staff member who speaks it on each pharmacy shift ("Have" when 3 points more than Metro speak neither English nor French, otherwise "Try to have"); the beauty and food brands these shoppers know | Pharmacy, Beauty, Convenience food |
| Many students and newcomers | Non-permanent residents are 4 points or more above Metro | Travel sizes, first-apartment basics, stock up before late August | Personal care, Household, Convenience food |
| A typical Vancouver neighbourhood | None of the above | Run the standard range; changes should come from the store's own sales. Shows the store's income, families, seniors and median age next to Metro's, and says when incomes lean a little above or below Metro (10% or more) | (none) |

Every call opens with the gap to Metro, then a colon and what to do, often with what not to do ("About twice Metro's share of one-person households: sell single-serve meals and small packs of paper towel and detergent, but don't give space to bulk packs"). The gap is a percentage under 1.75 times Metro, a multiple ("twice", "3.5 times") above that, and "Under half" at half or less (`gapToMetro`).

Each rule has a strength: how far the figure is past its threshold. A store shows its three strongest notes, strongest first.

Shares people can picture are written as "About 1 in 4" with the exact figure in brackets. The median age is written as "Half the residents are younger than 33.4".

Household income is low where most people live alone, because a one-person household has one income. So in those areas only the low-income share (which is adjusted for household size) can raise "Price matters here".

## Pharmacy services call (added 2026-11-19)

Pharmacy and health care services are Shoppers Drug Mart's fastest-growing line, and BC pharmacists have prescribed for 21 minor ailments and for contraception since 1 June 2023 ([13](13-shoppers-strategy.md)). Every store with census data now gets one services call, shown first on the Stock notes tab under "At the pharmacy counter" and named in the Pharmacy row of What to stock. Code: `serviceCall` in `src/data/stockNotes.ts`.

| Call | Fires when | What to do |
|---|---|---|
| Lead with medication reviews | 65+ share is 2 points or more above Metro | Book medication reviews, blister packs for anyone on several medicines, flu shot clinics every fall |
| Lead with minor ailments and contraception | Median age 3 or more years below Metro, or non-permanent residents 4 points or more above | Put pharmacist prescribing for contraception, UTIs and acne on the door and in the PC Health app; keep same-day slots |
| Lead with same-day care for families | Households with children 3 points or more above Metro | Same-day pharmacist visits for pink eye, rashes and hives; family flu shot days |
| ... in [language] | The main home language passes the language rule above | Added to the strongest call: offer the service in that language and say which languages the pharmacists speak. With no other call, it becomes "Lead with care in [language]" |
| Offer the full services list | None of the above | The standard list; the store's own bookings decide which to push |

The bars are lower than the shelf rules because a service needs fewer patients to fill a booking list than a category needs to fill a bay. Where several fire, the strongest wins, measured the same way as the notes.

Across the 29 Vancouver stores: minor ailments and contraception at 9 (downtown, the West End, Mount Pleasant, Dunbar and Marine Drive), medication reviews at 5 (three of them in Cantonese or Mandarin), care in Cantonese or Mandarin alone at 6, and the full list at 9. Both UBC stores: minor ailments and contraception in Mandarin.

## What it shows across the 29 Vancouver stores

- **Mostly people living alone** at 16 stores, from 40.3% of households (Cambie and West Broadway, V5Z) to 57.2% (Denman, V6G).
- **Few children** at 8 and **Many students and newcomers** at 8, mostly downtown and in the West End.
- **Cantonese** is the main home language at 7 stores in East Vancouver (up to 17.6% at Kingsway, V5R, where 11.0% speak neither English nor French), **Mandarin** at 2 (Kerrisdale and Dunbar), and **Punjabi** at 1 (Marine Drive, V5X).
- **Older than most of Vancouver** at Kerrisdale only (24.2% are 65+).
- **A typical Vancouver neighbourhood** at 3: both Fraser Street stores and 3303 Main Street (V5V and V5W).

The two profiled UBC stores read as young (median age 31.4), short on money by the low-income measure (30.0%, mostly students), and full of students (18.5% non-permanent residents). Mandarin (19.6% at home) is the fourth strongest signal there and is not shown.

## Limits

- **Inferred**: the calls are rules of thumb that link census figures to common pharmacy-retail practice. They are not sales results, and they should be checked against store sales before they change a planogram.
- **Area mismatch**: a postal area (FSA) is wider than a walk-in trade area and counts residents, not shoppers. Downtown stores also serve commuters and visitors whom the census does not count.
- **Several stores share a postal area** (for example V5S, V6E, V6B), so they get the same notes.
- **Language is not ethnicity or shopping habit.** The brand call is a starting point for a store walk, not a rule.

## Sources

- Statistics Canada, Census Profile, 2021 Census of Population: Vancouver CMA (933) and each postal area; see [09](09-census-by-postal-area.md).
- Metro Vancouver A (UBC), census subdivision 5915020, for the two profiled stores; see [07](07-census-2021-ubc.md).

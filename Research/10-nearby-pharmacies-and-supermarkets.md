# Pharmacies and supermarkets within a 10-minute walk of each Vancouver store

Each of the 29 City of Vancouver directory stores now lists the pharmacies and supermarkets within **800 m** (about a 10-minute walk, straight line) and flags the ones that are Loblaw banners. Other Shoppers Drug Mart stores in the radius are counted separately: they show where the network overlaps itself.

## Method

1. For each store, search OpenStreetMap with the Nominatim API for "pharmacy" and "supermarket" inside a box around the store's map position (one request a second, as the Nominatim usage policy asks).
2. Keep only places tagged `amenity=pharmacy` or `shop=supermarket`, within 800 m of the store.
3. Drop the store's own pharmacy (a Shoppers Drug Mart within 60 m) and duplicates (the same name within 40 m: a point and its building outline).
4. Name Loblaw banners from the place name: Shoppers Drug Mart (including Simply Pharmacy), Real Canadian Superstore, No Frills, T&T Supermarket, Your Independent Grocer, Loblaws City Market, Loblaw Pharmacy.

Code: `pipeline/etl/nearby.py`, tested in `pipeline/tests/test_nearby.py`. Refresh with `cd pipeline && python -m etl nearby`. Output: `src/data/generated/nearby.json`. The Overpass API, which would return every tagged place in one query, is not reachable from the build environment; Nominatim is.

## Results (Verified against OpenStreetMap, November 2026)

| Store | Other pharmacies | Supermarkets | Other SDM within 800 m (m) | Other Loblaw banners (m) |
|---|---|---|---|---|
| 201 Denman Place Mall | 3 | 7 | | No Frills 51 |
| 202 Granville St & 13th | 3 | 3 | 613 | Loblaws City Market 420 |
| 204 Kingsgate Mall | 7 | 7 | 791 | |
| 222 6305 Fraser Street | 5 | 9 | | |
| 232 Kerrisdale | 4 | 3 | | |
| 234 4th & Vine St. | 4 | 7 | | |
| 238 Broadway & Carnarvon | 2 | 8 | | |
| 263 885 West Broadway | 13 | 5 | 331 | |
| 272 Thurlow & Davie | 9 | 12 | 679, 732 | Your Independent Grocer 245 |
| 280 The Hub Broadway & Commercial | 4 | 2 | 156 | |
| 288 Dunbar | 2 | 1 | | |
| 2130 River District | 0 | 1 | | |
| 2221 1780 West Broadway | 3 | 5 | 612 | No Frills 494, Loblaws City Market 528 |
| 2227 Marine & Cambie | 0 | 1 | | T&T Supermarket 57 |
| 2228 Champlain Square | 0 | 2 | | Your Independent Grocer 61 |
| 2234 Cambie Village | 4 | 4 | | No Frills 742, Loblaw Pharmacy 753 |
| 2245 Robson & Burrard | 10 | 12 | 439, 559, 724, 732 | Loblaws City Market 648 |
| 2246 Yaletown | 10 | 12 | 514, 724, 783 | Loblaws City Market 627 |
| 2249 Commercial & Grant | 4 | 9 | | |
| 2252 Main Street | 4 | 2 | 791 | |
| 2274 East 49th & Elliot | 0 | 1 | | |
| 2275 The Ritz | 4 | 8 | 559, 770 | |
| 2276 4590 Fraser Street | 3 | 1 | | No Frills 96 |
| 2277 Granville | 10 | 11 | 439, 770, 784 | Loblaws City Market 324, T&T Supermarket 710 |
| 2279 Vancouver General Hospital | 12 | 3 | 332 | |
| 2289 El Dorado | 3 | 5 | | T&T Supermarket 389 |
| 2292 Liberty Building | 8 | 10 | 514, 679 | |
| 2294 Hastings & Slocan | 3 | 0 | | |
| 3005 East 10th Avenue | 4 | 2 | 157 | |

Every place, with its distance and a link to its OpenStreetMap page, is in the app and in `src/data/generated/nearby.json` (315 places in all).

## What stands out (Inferred)

- **Downtown overlaps itself.** Robson & Burrard (#2245), Yaletown (#2246) and Granville (#2277) each have three or four other Shoppers Drug Mart stores within 800 m. That is a network question for head office (which store carries which role), not a competitor question.
- **Loblaw banners sit next door at four stores**: No Frills 51 m from Denman Place Mall (#201) and 96 m from 4590 Fraser (#2276); T&T 57 m from Marine & Cambie (#2227); Your Independent Grocer 61 m from Champlain Square (#2228). At these stores fresh and centre-store grocery is best left to the sister banner, and the pair can be run as one trip (PC Optimum on both).
- **The hospital cluster is pharmacy-dense.** 885 West Broadway (#263) and VGH (#2279) each have 12 or 13 other pharmacies within 800 m, mostly independent and specialty pharmacies around Vancouver General Hospital. Front store, hours and services, not dispensing, are what can set them apart.
- **Edge-of-city stores have little nearby**: River District (#2130), East 49th & Elliot (#2274), Champlain Square (#2228) and Marine & Cambie (#2227) have no other pharmacy within 800 m, so their own pharmacy is likely the neighbourhood's default.

## In the app

The **Network** page (`#/network`) puts the overlap for all 31 stores in one table. Shoppers-to-Shoppers distances there are measured between the checked store positions (`Research/data/vancouver-sdm-stores.csv`), not from OpenStreetMap, so they agree in both directions. 14 of 31 stores have another Shoppers within 800 m. 12 have a sister Loblaw banner within 800 m. The closest pair is East 10th Avenue (#3005) and The Hub Broadway & Commercial (#280), 156 m apart.

## Limits

- **OpenStreetMap is volunteer-mapped.** Recently opened or unmapped stores are missed, and a few places carry a pharmacy tag they may not deserve (a medical clinic, for example). Treat the counts as a floor.
- **Straight-line distance**, not walking distance. Rail lines, the Fraser River and major roads make some walks longer.
- **Supermarkets only**, not convenience stores, dollar stores or beauty retailers. Those overlap with SDM too and are left for a later pass.
- **To verify**: OpenStreetMap names the pharmacy at 1750 East 10th Avenue (#3005) "Shoppers Simply Pharmacy", which would make it a Simply Pharmacy format like #2249.

## Sources

1. OpenStreetMap contributors, © OpenStreetMap, ODbL. https://www.openstreetmap.org/copyright (each place links to its own OpenStreetMap page in the app)
2. Nominatim search API. https://nominatim.org/release-docs/latest/api/Search/
3. Nominatim usage policy. https://operations.osmfoundation.org/policies/nominatim/

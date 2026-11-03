# 2021 census by postal area for the Vancouver stores

Each of the 29 City of Vancouver directory stores now shows the 2021 census for its **postal area**: the forward sortation area (FSA), the first three characters of the store's postal code. The 29 stores fall in 20 postal areas. Figures are compared with the **Vancouver census metropolitan area** (CMA 933), the same comparison the UBC stores use (see [07-census-2021-ubc.md](07-census-2021-ubc.md)).

## Why postal areas (Inferred)

- **The City of Vancouver is one census subdivision**, so a city-level census would show the same numbers for all 29 stores and tell them apart on nothing.
- **Census tracts and dissemination areas are finer** but need boundary files to place a store inside one. The Statistics Canada boundary site blocks automated clients, so this was not possible from the build environment without inventing a match.
- **Postal areas need no boundary lookup**: the postal code is already in each checked address, and Statistics Canada publishes a full Census Profile for every FSA.
- **The cost**: an FSA covers roughly 15,000 to 50,000 residents, wider than a walk-in pharmacy trade area. The panel says so. V6C (downtown business core) has only 2,846 residents; Granville (#2277) serves mostly workers and visitors, so read its census with care.

## Figures (Verified, Statistics Canada 2021 Census Profile)

| FSA | Stores | Population | Median age | Median household income (2020) | Renters | Immigrants | Non-permanent residents | Low income (LIM-AT) |
|---|---|---|---|---|---|---|---|---|
| V5K | 2294 | 23,431 | 42.0 | $92,000 | 39.4% | 38.8% | 3.2% | 9.2% |
| V5L | 2249 | 19,473 | 38.8 | $69,500 | 65.0% | 25.8% | 2.4% | 14.2% |
| V5N | 3005, 280 | 35,843 | 38.4 | $82,000 | 53.3% | 39.2% | 5.1% | 11.5% |
| V5R | 2289 | 48,150 | 39.2 | $82,000 | 44.0% | 55.5% | 7.7% | 11.2% |
| V5S | 2228, 2274, 2130 | 32,940 | 42.4 | $90,000 | 42.7% | 48.8% | 3.5% | 10.0% |
| V5T | 204 | 26,340 | 36.4 | $79,500 | 61.6% | 28.3% | 4.3% | 10.8% |
| V5V | 2276, 2252 | 24,288 | 39.2 | $103,000 | 39.5% | 36.3% | 3.7% | 7.3% |
| V5W | 222 | 20,828 | 40.8 | $91,000 | 45.3% | 44.2% | 5.7% | 9.8% |
| V5X | 2227 | 31,095 | 38.0 | $84,000 | 49.3% | 54.5% | 10.3% | 11.9% |
| V5Z | 263, 2234 | 24,957 | 40.4 | $88,000 | 49.1% | 39.5% | 5.7% | 13.1% |
| V6B | 2292, 2246 | 32,375 | 36.0 | $81,000 | 63.6% | 40.0% | 12.5% | 17.3% |
| V6C | 2277 | 2,846 | 40.0 | $88,000 | 56.8% | 52.6% | 6.5% | 19.4% |
| V6E | 2275, 272 | 27,482 | 37.6 | $66,500 | 76.4% | 41.3% | 12.0% | 17.5% |
| V6G | 201 | 28,013 | 41.6 | $66,000 | 79.8% | 38.7% | 10.1% | 17.3% |
| V6H | 202, 2279 | 17,742 | 39.6 | $79,000 | 62.7% | 32.4% | 5.1% | 12.2% |
| V6J | 2221 | 23,044 | 40.0 | $84,000 | 56.9% | 32.0% | 5.7% | 13.4% |
| V6K | 234, 238 | 27,146 | 38.8 | $89,000 | 56.1% | 29.5% | 6.9% | 10.7% |
| V6M | 232 | 16,421 | 46.8 | $83,000 | 45.6% | 50.7% | 6.0% | 17.1% |
| V6S | 288 | 15,711 | 36.4 | $84,000 | 45.9% | 45.3% | 11.7% | 23.5% |
| V6Z | 2245 | 20,683 | 38.8 | $80,000 | 56.0% | 42.2% | 11.7% | 17.9% |
| *Vancouver CMA* | | *2,642,825* | *40.8* | *$90,000* | *37.8%* | *41.8%* | *5.1%* | *11.1%* |

Residents by age (0–14, 15–24, 25–44, 45–64, 65+) are in `src/data/generated/fsaCensus.json` for every area.

## What stands out (Inferred)

- **West End and downtown (V6G, V6E, V6B, V6Z) are renter-heavy (56% to 80%) with low household income ($66,000 to $81,000)**: small households, convenience trips, smaller basket sizes. These are the strongest candidates for the urban-convenience format.
- **V6G (Denman Place Mall) has 19% of residents aged 65 and over**, the highest share in the downtown peninsula: a pharmacy-services and home-health signal.
- **V5V (Main Street, Fraser Street at 4590) has the highest median household income ($103,000) and the lowest low-income rate (7.3%)**: room for premium beauty and wellness.
- **V5R (El Dorado) and V5X (Marine & Cambie) are majority immigrant (55%)**: candidates for international food and personal care ranges, as at the UBC stores.
- **V6M (Kerrisdale) is the oldest area (median age 46.8)** and V6S (Dunbar) has the highest low-income rate (23.5%), likely students near UBC: two very different West Side profiles.

## How the figures were pulled

```
cd pipeline && python -m etl census
```

The command reads `Research/data/vancouver-sdm-stores.csv`, takes the FSA of each postal code and downloads each profile from the Census Profile SDMX API:

```
https://api.statcan.gc.ca/census-recensement/profile/sdmx/rest/data/STC_CP,DF_FSA/A5.2021A0011{FSA}.1..?format=csv
```

Characteristic codes used (gender = total): 1 (population), 40 (median age), 229 (median total household income), 1402 (renters, rate), 1515 (immigrants, rate), 1523 (non-permanent residents, rate), 331 (LIM-AT, rate), 8 (age total), 9, 14 to 24 (age groups). FSA profiles have no 2016 population, so growth is left out. Code is in `pipeline/etl/census.py`, tested in `pipeline/tests/test_census.py`.

## Sources

1. Statistics Canada, Census Profile, 2021 Census of Population, forward sortation areas. Example (V6G): https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/details/page.cfm?Lang=E&DGUIDlist=2021A0011V6G&GENDERlist=1&STATISTIClist=1,4&HEADERlist=0 (each store's panel links its own area).
2. Statistics Canada, Census Profile, 2021 Census of Population: Vancouver CMA. https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/details/page.cfm?Lang=E&DGUIDlist=2021S0503933&GENDERlist=1&STATISTIClist=1,4&HEADERlist=0
3. Statistics Canada, Census Profile SDMX web service. https://api.statcan.gc.ca/census-recensement/profile/sdmx/rest/

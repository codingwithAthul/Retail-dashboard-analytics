# Shoppers Drug Mart stores in the City of Vancouver

29 Shoppers Drug Mart locations inside the City of Vancouver (UBC is outside the city and already profiled), each with a map position and a cross-check against a second public source. The table is in [`data/vancouver-sdm-stores.csv`](data/vancouver-sdm-stores.csv). Nothing here is shown in the dashboard yet.

Gathered 2026-11-03.

## Method

1. **Positions: OpenStreetMap.** Searched Nominatim for "Shoppers Drug Mart", "Shoppers Drug Mart Pharmacy", "Shoppers" and "Shoppers Simply Pharmacy" inside the city's bounding box, kept results whose city is Vancouver, and read each shop's tags. 28 of 29 OSM shops link to their shoppersdrugmart.ca store page, which gives the store number.
2. **Second source: Shoppers Drug Mart's own store pages**, found through web search by store number (the site cannot be fetched directly from the build environment). Each page gives the store name, address and postal code. For two locations with no SDM page in the results, the second source is a pharmacy directory (Medimap, Cortico, The Drive).
3. **Position check.** Where an SDM page carries a map pin (shop.shoppersdrugmart.ca links include latitude and longitude), or where the SDM address geocodes to a building, the distance to the OSM shop point is recorded.

## Results

| | Stores |
|---|---|
| Address on OSM matches the second source | 22 |
| OSM address wrong, corrected from SDM | 4 (#222, #232, #2277, #2279) |
| OSM address has no house number, taken from SDM | 2 (#288, #2228) |
| No SDM page found, checked against pharmacy directories | 1 (#3005) |
| Position confirmed by a second point within 100 m | 11 (SDM map pin: 6, building address: 5) |
| Position from OSM shop point whose address matches SDM | 14 |
| Position not checked, marked approximate | 4 (#222, #288, #2228, #2279) |

Postal codes differ between OSM and SDM for 10 stores; the SDM postal code is used.

### Corrections the check caught

- **#2277 Granville**: OSM says 586 Dunsmuir Street; SDM says 586 Granville Street. Same postal code, and the Granville address geocodes 9 m from the OSM point, so only the street name was wrong.
- **#2279 Vancouver General Hospital**: OSM says 2730 Laurel Street; SDM says 2730 Oak Street. The point sits at the hospital, but the Oak Street address does not geocode, so it stays approximate.
- **#232 Kerrisdale**: OSM 2203, SDM 2303 West 41st Avenue. 2303 geocodes 15 m from the OSM point.
- **#222 Fraser Street**: OSM 6303, SDM 6305 Fraser Street. Not position-checked.
- **#2228 Champlain Square**: OSM has the mall lane (Couillard Mews), SDM has 7160 Kerr Street. Same postal code. Not position-checked.

### Points to know

- **#2249 Commercial & Grant** is a Shoppers Simply Pharmacy, the pharmacy-only format.
- **#3005, 1750 East 10th Avenue** is listed by pharmacy directories as a Shoppers Drug Mart pharmacy and in OSM as "Shoppers Simply Pharmacy" without a store number. It is probably a pharmacy-only or specialty site; its format needs confirming before it goes on the map.
- **Local area** is the City of Vancouver local area OSM assigns to the point. Stores on a boundary street (for example #232 on 41st Avenue) can fall on either side.
- An earlier list from storelocators.com counted about 30 City of Vancouver addresses. It could not be fetched again to compare line by line, so a store missing from both OSM and this list is possible.

## Sources

1. OpenStreetMap contributors, via Nominatim. https://nominatim.openstreetmap.org/ (data © OpenStreetMap contributors, ODbL)
2. Shoppers Drug Mart store pages, https://www.shoppersdrugmart.ca/store-locator/store/{number} (one page per store number in the CSV)
3. Medimap, Shoppers Simply Pharmacy 2249. https://medimap.ca/clinic/pharmacies/bc/vancouver/shoppers-simply-pharmacy-2249
4. The Drive, Shoppers Drug Mart Commercial & Grant. https://thedrive.ca/vancouver/shoppers-drug-mart-commercial-grant/
5. Medimap, Shoppers Drug Mart 3005. https://medimap.ca/clinic/pharmacies/bc/vancouver/shoppers-drug-mart-3005
6. Cortico, Shoppers Drug Mart #3005 Pharmacy. https://cortico.health/pharmacies/vancouver-bc/shoppers-drug-mart-3005-p1190

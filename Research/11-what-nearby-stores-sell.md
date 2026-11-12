# What nearby stores sell, and what to stock

Research gathered 2026-11-12. Code: `src/data/sellers.ts`. Shown on every directory store's panel, under "Within a 10-minute walk" and "What to stock, given the neighbours".

## Why

Counting supermarkets is not enough. If a Save-On-Foods next door sells produce, meat and bakery, a Shoppers Drug Mart shelf of vegetables is wasted space: shoppers buy them next door. So each nearby place needs a line on what it **mainly sells**, mapped to the store's own categories (Pharmacy, OTC health, Beauty, Personal care, Convenience food, Fresh grocery, Household). Those lines then turn into a **stock call** per category.

## Method

1. **List the places.** The 315 pharmacies and supermarkets within 800 m of the 29 Vancouver stores come from OpenStreetMap (see [10](10-nearby-pharmacies-and-supermarkets.md)). They have 119 distinct names.
2. **Profile the chains.** Each chain is matched by name, case ignored, and accepts the spellings found on the map (for example `Pure Intergrative`, `Fresh Street Market`, `Choice's Market`). Its usual range comes from its own website where one was reachable, otherwise from trade press. Each profile lists:
   - the categories the chain sells;
   - the categories where it is a **destination**, meaning a shopper would make the trip for them.
3. **Label the independents.** An independent is labelled **Inferred** from its map type: a pharmacy is assumed to sell prescriptions and over-the-counter medicine, and a grocer's range and size are marked as not checked. A few are read from their name ("Produce", "Meats", "Halal"), and the panel says so.
4. **Make the calls.** Other Shoppers Drug Mart stores are left out, because they carry the same offer.

| Category | Call | Rule |
|---|---|---|
| Pharmacy, OTC health, Beauty, Personal care | Compete | The store's core business. The call names the nearest place that is a destination for the category, and counts the other pharmacies. |
| Fresh grocery | Avoid | A chain that is a fresh-food destination is within 800 m. The store keeps milk, eggs and bread for top-ups. |
| | Differentiate | Only small independent grocers are nearby, and their range is not checked. |
| | Compete | There is no grocer within 800 m. |
| Convenience food | Differentiate | A ready-meal counter (a destination chain) is within 400 m, about a 5-minute walk. The store should win on speed and hours rather than meals. |
| | Compete | Otherwise. |
| Household | Differentiate | A chain with the full range is within 800 m. The store keeps top-up sizes and its own brands. |
| | Compete | Otherwise. |

These calls are **Inferred**: rules applied to public data, not sales results. They should be checked on a store walk.

## Chain profiles

| Chain | Mainly sells | Destination for | Source |
|---|---|---|---|
| London Drugs | Pharmacy, cosmetics, personal care, electronics, appliances, photo, home | Pharmacy, OTC, Beauty, Personal care, Household | [londondrugs.com](https://www.londondrugs.com/about-london-drugs/about-us.html) |
| Pharmasave | Pharmacy; front store of health, beauty, vitamins, home health care | Pharmacy, OTC | [pharmasave.com](https://pharmasave.com/) |
| Rexall (incl. PharmaPlus) | Pharmacy, beauty, convenience | Pharmacy, OTC | [rexall.ca](https://www.rexall.ca/) |
| Pure Integrative Pharmacy | Pharmacy with professional-grade supplements and natural health | Pharmacy, OTC | [purepharmacy.com](https://purepharmacy.com/pages/natural-health) |
| Medicine Shoppe, I.D.A., PharmaChoice, Guardian | Independently owned banner pharmacy, small front store | Pharmacy | [McKesson brands](https://mckesson.ca/our-brands), [PharmaChoice](https://www.pharmachoice.com/?p=20) |
| Costco (pharmacy) | Membership warehouse: bulk groceries, fresh food, household | Fresh grocery, Household | [costco.ca](https://www.costco.ca/) |
| Safeway | Full supermarket: produce, meat, bakery, deli, floral, often a pharmacy | Fresh, Convenience food, Household | [Empire banners](https://empireco.ca/about/businesses/grocery-and-retail), [safeway.ca](https://www.safeway.ca/) |
| Save-On-Foods | Full supermarket: produce, meat and seafood, bakery, deli, floral, often a pharmacy | Fresh, Convenience food, Household | [Pattison Food Group](https://pattisonfoodgroup.com/retail-banners) |
| IGA | Full supermarket: produce, meat, dairy, bakery, deli, frozen, household, pet | Fresh, Convenience food, Household | [shop.igabc.com](https://shop.igabc.com/) |
| Urban Fare | Upscale supermarket: organic produce, bakery, deli and ready meals, meat, seafood | Fresh, Convenience food | [urbanfare.com](https://www.urbanfare.com/categories/deli-ready-made-meals-id-30726) |
| Nesters Market | Organic produce, bakery, deli and bistro, meat and seafood, natural aisle | Fresh, Convenience food | [nestersmarket.com](https://www.nestersmarket.com/produce/) |
| Loblaws City Market (incl. Loblaw Pharmacy) | Produce, meat, seafood, deli, bakery, large prepared-meal range | Fresh, Convenience food | [Loblaw careers](https://careers.loblaw.ca/retail/city-market), [Loblaw news](https://www.loblaw.ca/en/new-loblaws-city-market-opens-in-south-granville-bringing-fresh-meals-everyday-value-and-convenient-grocery-shopping-to-vancouver/) |
| No Frills | Discount supermarket: produce, meat, dairy, bakery, frozen | Fresh, Household | [nofrills.ca](https://nofrills.ca/en/collection/price-match) |
| Your Independent Grocer | Full supermarket (Loblaw franchise) | Fresh, Household | [yourindependentgrocer.ca](https://www.yourindependentgrocer.ca/) |
| Whole Foods Market | Natural and organic: produce, prepared foods, bakery, supplements, body care | Fresh, Convenience food | [wholefoodsmarket.com](https://www.wholefoodsmarket.com/departments) |
| Choices Market | Organic produce, deli and salad bar, gluten-free bakery, supplements, body care | Fresh, Convenience food | [choicesmarkets.com](https://www.choicesmarkets.com/company/) |
| Fresh St. Market | Produce, meat, seafood, bakery, deli, cheese, bulk, ready-to-eat | Fresh, Convenience food | [freshstmarket.com](https://www.freshstmarket.com/about-us/departments/seafood), [Retail Insider](https://retail-insider.com/retail-insider/2020/02/inside-downtown-vancouvers-newest-grocery-store-fresh-st-market-photos/) |
| T&T Supermarket | Asian supermarket: produce, live seafood, meat, bakery, hot food | Fresh, Convenience food | [Grocery Dive](https://www.grocerydive.com/news/inside-t-and-t-supermarket-bellevue-washington/734929/) |
| H Mart | Korean supermarket: produce, marinated meats, seafood | Fresh | [Chicago Magazine](https://www.chicagomag.com/?p=22138) |
| Sungiven Foods | Fresh-focused Asian grocer, mostly own brands | Fresh | [Canadian Grocer](https://canadiangrocer.com/inside-sungiven-foods-fresh-focused-growth) |
| PriceSmart Foods | Value supermarket: produce, specialty meat and seafood, meals to go | Fresh | [Media release](https://dam.cdn.saveonfoods.com/PDFs/Media-Release/PSF-Broadway-Media-Release.pdf) |
| Buy-Low Foods | Value supermarket: produce, meat, deli, bakery, bulk | Fresh | [Western Grocer](https://westerngrocer.com/?p=17129) |
| Kin's Farm Market | Produce store | Fresh | [Wikipedia](https://en.wikipedia.org/wiki/Kin%27s_Farm_Market) |
| Fruiticana | South Asian grocer known for produce and spices | Fresh | [Canadian Grocer](https://canadiangrocer.com/tour-bcs-south-asian-specialist-fruiticana) |
| Fujiya | Japanese grocer: daily sushi and bento, pantry | Convenience food | [Daily Hive](https://dailyhive.com/vancouver/cheap-eats-vancouver-fujiya-foods) |
| ABURI Market | Premium Japanese grocer: grab-and-go sushi and bento, imports | Convenience food | [Daily Hive](https://dailyhive.com/vancouver/aburi-market-granville) |
| Meinhardt Fine Foods | Gourmet grocer with a large take-out deli | Convenience food | [Daily Hive](https://dailyhive.com/vancouver/meinhardt-downtown-closed) |

## What it shows across the 29 stores

- **Fresh grocery is Avoid at 26 of 29 stores.** In the City of Vancouver almost every Shoppers has a fresh-food destination within a 10-minute walk, often under 100 m. Examples: No Frills is 51 m from Denman Place Mall, Kin's Farm Market 53 m from Champlain Square, and T&T 57 m from Marine & Cambie. At 8 of these stores the destination is a Loblaw banner.
- **Differentiate** applies at Dunbar and East 49th & Elliot, where only independents are nearby. **Compete** applies only at Hastings & Slocan, which has no grocer within 800 m.
- **Convenience food** is Differentiate at 17 stores, where a ready-meal counter is within 400 m, and Compete at 12.
- **Household** is Differentiate at 23 stores, wherever London Drugs or a full supermarket is within 800 m, and Compete at 6.

## Limits

- A chain profile describes the chain's usual range. A single store may lack a department, such as a pharmacy or a hot bar.
- Store-level checks against each chain's own store locator are not done yet.
- OpenStreetMap can be stale. For example, Meinhardt's downtown store closed and ABURI Market took its space. A stale entry can make a call wrong.
- Distance is straight-line, not walking distance.
- No sales or basket data is used. The calls describe where shoppers can buy a category nearby, not how much of it they buy.

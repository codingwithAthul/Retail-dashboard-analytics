# Loblaw Companies: banners and how they differ

## Summary

Loblaw Companies Limited is Canada's largest food and pharmacy retailer. It runs many store banners rather than one brand, because each banner is aimed at a different **price position**, **region** and **shopper**. The two levers that separate banners are:

1. **Price position**: discount (lowest price, fewer services) versus market / conventional (wider fresh and service departments, higher price).
2. **Region**: several banners exist because Loblaw bought regional chains and kept their local names (for example Provigo in Quebec, Zehrs and Fortinos in Ontario, Dominion in Newfoundland and Labrador).

A third lever is **specialty**: T&T (Asian grocery), Shoppers Drug Mart (pharmacy, beauty, convenience), Wholesale Club (bulk / business buyers).

## Company facts (Verified)

| Item | Value | Source |
|---|---|---|
| Revenue (2024) | CA$61.014 billion | [1] |
| Operating income (2024) | CA$3.902 billion | [1] |
| Net income (2024) | CA$2.275 billion | [1] |
| Employees (2024) | 220,000 | [1] |
| Parent | George Weston Limited, 52.6% (2023) | [1] |
| Banner count | "22 regional and market-segment banners", plus pharmacies, banking and apparel | [1] |
| 2026 investment | CA$2.4 billion including 70 new stores, 31 of them No Frills or Maxi | [4] |

## Banners by division

Loblaw groups grocery stores into a **Discount** division and a **Market** division [3]. Reporting in 2024 indicates a dedicated **hard discount** division (No Frills, Maxi) was created and Real Canadian Superstore moved under Market (To verify, single summarised source [1]).

### Discount (price-first)

| Banner | Where | Positioning | Source |
|---|---|---|---|
| No Frills | National, concentrated in Ontario and Western Canada | Deep discount, no service departments, aimed at "price-sensitive urban customers" | [3], [4] |
| Maxi / Maxi & Cie | Quebec | Discount; reported as Quebec's top grocery retailer in 2025-26 | [2], [4] |
| Real Canadian Superstore | Western Canada, Ontario, Yukon (120 stores, 2024) | "One-stop" combination store: about a third of floor space is electronics, housewares and clothing. Slogan "Save For Real." | [2] |
| Extra Foods | Western Canada | Discount banner, now defunct | [1], [3] |

### Market (conventional, fresh and service)

| Banner | Where | Positioning | Source |
|---|---|---|---|
| Loblaws, City Market | Ontario and other urban markets | "Inspire" format: upscale decor, high-end service departments | [3] |
| Provigo | Quebec | "Inspire" format | [3] |
| Zehrs, Fortinos | Ontario | Standard market format | [3] |
| Your Independent Grocer, Valu-mart | Mostly Ontario, franchised | Standard market format, community stores | [3] |
| Real Atlantic Superstore, Dominion | Atlantic Canada; Dominion in NL | Standard market format (Atlantic Superstore renamed 2024) | [2], [3] |
| T&T Supermarket | BC, Alberta, Ontario, Quebec (and US) | Asian grocery, standard market format | [3] |

### Pharmacy and other

| Business | Notes | Source |
|---|---|---|
| Shoppers Drug Mart / Pharmaprix | Acquired 2014 for about CA$12.4 billion. Pharmaprix is the Quebec name. See [02-sdm-store-formats.md](02-sdm-store-formats.md). | [1], [5] |
| Loblaw pharmacies | In-store pharmacies in Superstore and Market banners; "select" No Frills | [2], [3] |
| PC Financial | Banking and credit cards, launched 1998 | [1] |
| Wholesale Club | Bulk format for small businesses | [1] |

## Control (private label) brands

- **President's Choice (PC)**: premium private label, launched 1980s [1].
- **no name**: value private label, launched 1978 with 16 items in yellow packaging [1].
- **Joe Fresh**: apparel [1].
- **Life Brand**: Shoppers Drug Mart's private label, created 1962 [5].
- **PC Optimum**: shared loyalty program across Loblaw and Shoppers. Members earn 15 points per dollar at Shoppers [6].

## What this means for the dashboard (Inferred)

- A store's **banner already tells head office its price position**. The dashboard should show banner and format first.
- Comparing stores only makes sense **within a banner and format**. A Wesbrook SDM should be compared to other SDMs of similar size, not to a Superstore.
- Future versions that add other banners need a `banner` and `division` field on every store record. The v1 data model includes these now.

## Sources

1. Wikipedia, "Loblaw Companies". https://en.wikipedia.org/wiki/Loblaw_Companies (accessed 2026-11-03)
2. Wikipedia, "Real Canadian Superstore". https://en.wikipedia.org/wiki/Real_Canadian_Superstore (accessed 2026-11-03)
3. DZ Retail Blog, "Loblaws divisions explained" (information as of 2020-04-17). https://dzretailblog.blogspot.com/2020/04/loblaws-divisions-explained.html
4. Retail Insider, "Grocers double down on discount banners in Canada" (2026-03-19). https://retail-insider.com/retail-insider/2026/03/grocers-double-down-on-discount-banners-in-canada/
5. Shoppers Drug Mart, "About our history". https://corporate.shoppersdrugmart.ca/en/about-our-history
6. Wikipedia, "Shoppers Drug Mart". https://en.wikipedia.org/wiki/Shoppers_Drug_Mart

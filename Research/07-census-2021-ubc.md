# 2021 census for the UBC stores

Both UBC stores sit in the census subdivision **Metro Vancouver A** (CSD 5915020, DGUID 2021A00055915020), the regional district electoral area that holds the UBC campus and the University Endowment Lands. The dashboard compares it with the **Vancouver census metropolitan area** (CMA 933, DGUID 2021S0503933).

## Figures (Verified, Statistics Canada 2021 Census Profile)

| Measure | Metro Vancouver A | Vancouver CMA | Census data |
|---|---|---|---|
| Population, 2021 | 18,612 | 2,642,825 | 100% |
| Population, 2016 | 16,133 | 2,463,431 | 100% |
| Change, 2016 to 2021 | +15.4% | +7.3% | 100% |
| Median age | 31.4 | 40.8 | 100% |
| Average age | 36.2 | 41.7 | 100% |
| Median total household income, 2020 | $63,600 | $90,000 | 100% |
| Median after-tax household income, 2020 | $58,000 | | 100% |
| Households that rent | 57.3% | 37.8% | 25% sample |
| Immigrants | 46.0% | 41.8% | 25% sample |
| Non-permanent residents | 18.5% | 5.1% | 25% sample |
| Low income, LIM-AT | 30.0% | 11.1% | 100% |
| Average household size | 2.2 | | 100% |
| One-person households | 32.8% | | 100% |
| Bachelor's degree or higher, age 25 to 64 | 79.6% | | 25% sample |
| Land area | 815.21 km² | | |

Residents by age (100% data, total 18,610): 0 to 14: 2,730 (14.7%); 15 to 24: 4,625 (24.9%); 25 to 44: 5,170 (27.8%); 45 to 64: 3,940 (21.2%); 65 and over: 2,145 (11.5%).

## How to read it (Inferred)

- **Density is left out.** The 815 km² area is mostly parkland and rural land, so 22.8 people per km² says nothing about the campus.
- **Low income and household income are pulled down by students.** Students report little income, so 30% low income and a $63,600 median describe student households, not the faculty and condo owners around Wesbrook. Use them as a signal of price sensitivity near the academic core, not as a measure of spending power in Wesbrook Village.
- **18.5% non-permanent residents**, almost four times the metro rate, matches UBC's international student share and supports a small international beauty and food range at University Blvd.
- **Fast growth (+15.4%)** is Wesbrook construction; it supports the resident-first role of #2247.
- Census age bands are **residents**, not shoppers. The estimated customer age profile on the same tab also counts commuters and visitors.

## How the figures were pulled

The Statistics Canada website (www12.statcan.gc.ca) blocks automated clients, so the figures were read from the Census Profile SDMX API, which serves the same tables:

```
https://api.statcan.gc.ca/census-recensement/profile/sdmx/rest/data/STC_CP,DF_CSD/A5.2021A00055915020.1..?format=csv
https://api.statcan.gc.ca/census-recensement/profile/sdmx/rest/data/STC_CP,DF_CMACA/A5.2021S0503933.1..?format=csv
```

Characteristic codes used: 1, 2, 3 (population), 7 (land area), 9 to 33 (age), 39, 40 (age), 56 (household size), 229, 230 (household income), 331 (LIM-AT), 1402 (renters), 1515 (immigrants), 1523 (non-permanent residents), 2024 (education, 25 to 64). Gender = total; statistic 1 = counts, 4 = rates.

## Sources

1. Statistics Canada, Census Profile, 2021 Census of Population: Metro Vancouver A, Regional district electoral area. https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/details/page.cfm?Lang=E&DGUIDlist=2021A00055915020&GENDERlist=1&STATISTIClist=1,4&HEADERlist=0
2. Statistics Canada, Census Profile, 2021 Census of Population: Vancouver CMA. https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/details/page.cfm?Lang=E&DGUIDlist=2021S0503933&GENDERlist=1&STATISTIClist=1,4&HEADERlist=0
3. Statistics Canada, Census Profile SDMX web service. https://api.statcan.gc.ca/census-recensement/profile/sdmx/rest/

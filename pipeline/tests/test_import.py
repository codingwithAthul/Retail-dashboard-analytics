"""A real export does not come from our generator: different stores, products, codes and history length."""

import json
from pathlib import Path

import pandas as pd

from etl.__main__ import main

DAYS = pd.date_range("2025-03-01", "2026-03-31", freq="D")  # 13 full months


def write_export(folder: Path) -> None:
    folder.mkdir()
    pd.DataFrame([{
        "store_id": "0815", "store_name": "Kitsilano", "banner": "Shoppers Drug Mart",
        "store_format": "Conventional", "city": "Vancouver", "district": "West",  # extra column
    }]).to_csv(folder / "dim_store.csv", index=False)
    pd.DataFrame([
        {"category_id": "RX", "category_name": "Pharmacy", "department": "Pharmacy"},
        {"category_id": "BTY", "category_name": "Beauty", "department": "Front store"},
    ]).to_csv(folder / "dim_category.csv", index=False)
    pd.DataFrame([
        {"product_id": "100001", "product_name": "Prescription", "category_id": "RX", "unit_price": 40},
        {"product_id": "200001", "product_name": "Lipstick", "category_id": "BTY", "unit_price": 20},
        {"product_id": "200002", "product_name": "Nail polish", "category_id": "BTY", "unit_price": 10},
    ]).to_csv(folder / "dim_product.csv", index=False)

    rows = []
    for d in DAYS:
        rows += [
            {"date": d.date(), "store_id": "0815", "product_id": "100001", "units": 10, "net_sales": 400.0},
            {"date": d.date(), "store_id": "0815", "product_id": "200001", "units": 5, "net_sales": 100.0},
            {"date": d.date(), "store_id": "0815", "product_id": "200002", "units": 12, "net_sales": 120.0},
        ]
    pd.DataFrame(rows).to_csv(folder / "fact_sales.csv", index=False)
    pd.DataFrame({"date": DAYS.date, "store_id": "0815", "transactions": 20}).to_csv(folder / "fact_traffic.csv", index=False)


def test_real_export_builds_a_summary(tmp_path):
    write_export(tmp_path / "export")
    main(["run", "--input", str(tmp_path / "export"), "--out", str(tmp_path / "sales.json")])
    summary = json.loads((tmp_path / "sales.json").read_text())

    assert summary["source"] == "import"
    assert summary["period"] == {"start": "2025-03", "end": "2026-03"}
    store = summary["stores"]["0815"]  # leading zero kept
    assert len(store["months"]) == 13
    assert store["months"][-1] == {"key": "2026-03", "sales": 31 * 620, "transactions": 31 * 20}
    assert store["pharmacyShare"] == round(400 / 620, 4)
    assert [i["name"] for i in store["topItems"]] == ["Nail polish", "Lipstick"]
    assert [c["category"] for c in store["categories"]] == ["Pharmacy", "Beauty"]

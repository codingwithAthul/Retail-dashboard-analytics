"""Star schema for store sales.

Facts are at the grain a point-of-sale system exports every day:
- fact_sales: one row per store, day and product.
- fact_traffic: one row per store and day (customer transactions).
Dimensions describe stores, products and categories. dim_date is built by the pipeline.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Column:
    name: str
    dtype: str  # "str", "int", "float" or "date"
    description: str
    nullable: bool = False
    min_value: float | None = None
    references: str | None = None  # "table.column" this key must exist in
    allowed: tuple[str, ...] | None = None  # the only values this column may hold


@dataclass(frozen=True)
class Table:
    name: str
    description: str
    columns: tuple[Column, ...]
    primary_key: tuple[str, ...]

    @property
    def column_names(self) -> list[str]:
        return [c.name for c in self.columns]

    def column(self, name: str) -> Column:
        for c in self.columns:
            if c.name == name:
                return c
        raise KeyError(f"{self.name} has no column {name}")


DIM_STORE = Table(
    name="dim_store",
    description="One row per store.",
    primary_key=("store_id",),
    columns=(
        Column("store_id", "str", "Store number, e.g. 2247."),
        Column("store_name", "str", "Store name as shown in the dashboard."),
        Column("banner", "str", "Loblaw banner, e.g. Shoppers Drug Mart."),
        Column("store_format", "str", "Store format, e.g. Urban / mixed-use."),
        Column("city", "str", "City."),
    ),
)

DIM_CATEGORY = Table(
    name="dim_category",
    description="One row per merchandise category.",
    primary_key=("category_id",),
    columns=(
        Column("category_id", "str", "Category code, e.g. C01."),
        Column("category_name", "str", "Category name as shown in the dashboard."),
        Column("department", "str", "Pharmacy or Front store.", allowed=("Pharmacy", "Front store")),
    ),
)

DIM_PRODUCT = Table(
    name="dim_product",
    description="One row per product (item).",
    primary_key=("product_id",),
    columns=(
        Column("product_id", "str", "Product code, e.g. P001."),
        Column("product_name", "str", "Product name."),
        Column("category_id", "str", "Category of the product.", references="dim_category.category_id"),
        Column("unit_price", "float", "Regular shelf price in CAD.", min_value=0.01),
    ),
)

DIM_DATE = Table(
    name="dim_date",
    description="One row per calendar day in the data. Built by the pipeline.",
    primary_key=("date",),
    columns=(
        Column("date", "date", "Calendar day."),
        Column("year", "int", "Calendar year."),
        Column("month", "int", "Month number, 1 to 12.", min_value=1),
        Column("month_key", "str", "Year and month, YYYY-MM."),
        Column("day_of_week", "int", "0 = Monday to 6 = Sunday.", min_value=0),
        Column("is_weekend", "int", "1 on Saturday and Sunday, otherwise 0.", min_value=0),
        Column("academic_term", "str", "UBC term: Winter T1, Winter T2 or Summer."),
    ),
)

FACT_SALES = Table(
    name="fact_sales",
    description="Units and net sales per store, day and product.",
    primary_key=("date", "store_id", "product_id"),
    columns=(
        Column("date", "date", "Business day."),
        Column("store_id", "str", "Store.", references="dim_store.store_id"),
        Column("product_id", "str", "Product.", references="dim_product.product_id"),
        Column("units", "int", "Units sold.", min_value=0),
        Column("net_sales", "float", "Sales after discounts, before tax, in CAD.", min_value=0),
    ),
)

FACT_TRAFFIC = Table(
    name="fact_traffic",
    description="Customer transactions (receipts) per store and day.",
    primary_key=("date", "store_id"),
    columns=(
        Column("date", "date", "Business day."),
        Column("store_id", "str", "Store.", references="dim_store.store_id"),
        Column("transactions", "int", "Number of receipts.", min_value=0),
    ),
)

TABLES: dict[str, Table] = {
    t.name: t for t in (DIM_STORE, DIM_CATEGORY, DIM_PRODUCT, DIM_DATE, FACT_SALES, FACT_TRAFFIC)
}

# Tables a real store export must provide. dim_date is always built by the pipeline.
INPUT_TABLES = ("dim_store", "dim_category", "dim_product", "fact_sales", "fact_traffic")

"""SAMPLE DATA ASSUMPTIONS. Not real store data.

Each profile sets the shape of one store's synthetic sales. Shapes follow the research
(Research/03 and Research/06); magnitudes are illustrative only.
"""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class StoreProfile:
    store_id: str
    seed: int
    # Illustrative average monthly sales in CAD at the start of the data.
    base_monthly: float
    # Yearly growth, applied smoothly day by day.
    growth: float
    # Multiplier for each calendar month, January first.
    seasonality: tuple[float, ...]
    # Multiplier for each weekday, Monday first.
    weekday: tuple[float, ...]
    average_basket: float
    # Share of sales by category name; adds up to 1.
    mix: dict[str, float]
    # How strongly each product sells within its category. Products not listed get 1.0; 0 means not carried.
    product_weights: dict[str, float] = field(default_factory=dict)


PROFILES: dict[str, StoreProfile] = {
    # Wesbrook Village: residential, steady, prescription-heavy, carries prestige beauty.
    "2247": StoreProfile(
        store_id="2247",
        seed=2247,
        base_monthly=610_000,
        growth=0.06,
        seasonality=(0.96, 0.93, 0.98, 0.98, 1.0, 0.98, 0.97, 0.97, 1.0, 1.01, 1.04, 1.18),
        weekday=(0.97, 0.96, 0.97, 0.99, 1.04, 1.07, 1.0),
        average_basket=38.5,
        mix={
            "Pharmacy": 0.44,
            "Beauty": 0.17,
            "OTC health": 0.11,
            "Personal care": 0.10,
            "Convenience food": 0.08,
            "Household": 0.05,
            "Seasonal": 0.05,
        },
        product_weights={
            "P001": 0.8,  # New prescription
            "P002": 2.2,  # Refills: settled residents, chronic medication
            "P003": 1.6,  # Vitamin D3
            "P009": 2.4,  # Prestige moisturiser
            "P010": 1.8,  # Prestige foundation
            "P011": 1.3,  # Sunscreen
            "P013": 0.6,  # Lip balm
            "P015": 2.2,  # Baby wipes: young families
            "P021": 3.0,  # Milk
            "P022": 0.4,  # Energy drink
            "P023": 0.5,  # Bottled water
            "P024": 0.3,  # Instant noodles
            "P025": 0.6,  # Chocolate bar
            "P030": 0.7,  # Dish soap
            "P031": 1.8,  # Greeting cards
            "P032": 0.3,  # Ruled notebook
        },
    ),
    # University Blvd: student traffic, follows the academic calendar, front-store heavy, mass beauty only.
    "2273": StoreProfile(
        store_id="2273",
        seed=2273,
        base_monthly=540_000,
        growth=0.04,
        seasonality=(1.08, 1.05, 1.10, 1.12, 0.78, 0.66, 0.64, 0.70, 1.24, 1.14, 1.12, 1.17),
        weekday=(1.08, 1.10, 1.10, 1.08, 1.02, 0.82, 0.80),
        average_basket=17.9,
        mix={
            "Pharmacy": 0.30,
            "Convenience food": 0.20,
            "Personal care": 0.14,
            "OTC health": 0.13,
            "Beauty": 0.12,
            "Household": 0.06,
            "Seasonal": 0.05,
        },
        product_weights={
            "P001": 1.4,  # New prescription: acute care, walk-in clinic nearby
            "P002": 1.0,
            "P006": 1.8,  # Cold and flu
            "P009": 0.0,  # No prestige beauty
            "P010": 0.0,
            "P012": 1.6,  # Mascara (mass)
            "P015": 0.3,  # Baby wipes
            "P016": 1.6,  # Life Brand shampoo
            "P021": 0.8,  # Milk
            "P022": 2.6,  # Energy drink
            "P023": 2.4,  # Bottled water
            "P024": 2.2,  # Instant noodles
            "P025": 1.5,  # Chocolate bar
            "P032": 2.5,  # Ruled notebook
            "P034": 0.6,  # Boxed chocolates
        },
    ),
}

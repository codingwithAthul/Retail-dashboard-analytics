import json

from etl.nearby import RADIUS_M, classify, distance_m, nearby_for_store, viewbox, write_nearby

STORE = {"store_number": "201", "lat": "49.28916", "lng": "-123.13864"}


def place(name, lat, lon, category="amenity", kind="pharmacy", osm_id=1, osm_type="node"):
    return {"name": name, "lat": str(lat), "lon": str(lon), "category": category, "type": kind, "osm_id": osm_id, "osm_type": osm_type}


def test_distance_is_about_right():
    # 0.009 degrees of latitude is about 1 km.
    assert 990 < distance_m(49.28, -123.13, 49.289, -123.13) < 1010


def test_viewbox_covers_the_radius():
    left, top, right, bottom = viewbox(49.28, -123.13)
    assert distance_m(49.28, -123.13, top, -123.13) >= RADIUS_M
    assert distance_m(49.28, -123.13, 49.28, right) >= RADIUS_M
    assert left < right and bottom < top


def test_classify_names_loblaw_banners_and_kinds():
    assert classify(place("London Drugs", 0, 0)) == ("Pharmacy", None)
    assert classify(place("Shoppers Drug Mart", 0, 0)) == ("Pharmacy", "Shoppers Drug Mart")
    assert classify(place("大統華 T&T Supermarket", 0, 0, "shop", "supermarket")) == ("Supermarket", "T&T Supermarket")
    assert classify(place("Real Canadian Superstore", 0, 0, "shop", "supermarket")) == ("Supermarket", "Real Canadian Superstore")
    assert classify(place("No Frills", 0, 0, "shop", "supermarket")) == ("Supermarket", "No Frills")
    assert classify(place("Safeway", 0, 0, "shop", "supermarket")) == ("Supermarket", None)
    # Simply Pharmacy is a Shoppers Drug Mart format; Loblaw Pharmacy sits inside Loblaw grocery stores.
    assert classify(place("Shoppers Simply Pharmacy", 0, 0)) == ("Pharmacy", "Shoppers Drug Mart")
    assert classify(place("Loblaw Pharmacy", 0, 0)) == ("Pharmacy", "Loblaw Pharmacy")


def test_classify_drops_places_of_other_types():
    assert classify(place("Pharmacy Lane Cafe", 0, 0, "amenity", "cafe")) is None
    assert classify(place("", 0, 0)) is None


def test_nearby_keeps_the_radius_drops_the_store_itself_and_duplicates():
    results = [
        place("Shoppers Drug Mart", 49.28920, -123.13860, osm_id=1),  # the store itself
        place("Davie Pharmacy", 49.2821, -123.1342, osm_id=2),  # ~850 m: outside
        place("Denman Pharmacy", 49.2900, -123.1400, osm_id=3),
        place("Denman Pharmacy", 49.29005, -123.14005, osm_id=4, osm_type="way"),  # same place, building outline
        place("Safeway", 49.2885, -123.1384, "shop", "supermarket", osm_id=5),
    ]
    found = nearby_for_store(STORE, results)
    assert [p["name"] for p in found] == ["Safeway", "Denman Pharmacy"]
    assert all(p["distanceM"] <= RADIUS_M for p in found)
    assert found[0]["osm"] == "n5"


def test_write_nearby_is_sorted_and_stable(tmp_path):
    out = tmp_path / "nearby.json"
    write_nearby({"2246": [], "201": []}, out)
    data = json.loads(out.read_text())
    assert list(data["stores"]) == ["201", "2246"]
    assert data["radiusM"] == RADIUS_M

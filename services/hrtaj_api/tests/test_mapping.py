from app.import_utils import map_headers


def test_map_headers_arabic():
    columns = [
        "المنطقة",
        "نوع",
        "السعر",
        "العنوان",
        "اسم المالك / س",
        "الرقم",
    ]
    mapping, _ = map_headers(columns)
    assert mapping["area"] == "المنطقة"
    assert mapping["type"] == "نوع"
    assert mapping["price"] == "السعر"
    assert mapping["address"] == "العنوان"
    assert mapping["owner_name"] == "اسم المالك / س"
    assert mapping["owner_phone"] == "الرقم"


def test_map_headers_english():
    columns = ["Agent", "Area", "Type", "Price", "Address", "Unit Code"]
    mapping, _ = map_headers(columns)
    assert mapping["agent"] == "Agent"
    assert mapping["area"] == "Area"
    assert mapping["type"] == "Type"
    assert mapping["price"] == "Price"
    assert mapping["address"] == "Address"
    assert mapping["unit_code"] == "Unit Code"

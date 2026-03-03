import json
import os

DB_FILE = os.path.join(os.path.dirname(__file__), "database.json")

def init_db():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w") as f:
            json.dump([], f)
    print("Local JSON database initialized successfully")

def add_products(products_list):
    """Insert/upsert a batch of products into local JSON file"""
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "r") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = []
    else:
        data = []
        
    # Update or insert strategy
    existing_ids = {p["id"]: i for i, p in enumerate(data)}
    for p in products_list:
        if p["id"] in existing_ids:
            data[existing_ids[p["id"]]] = p
        else:
            data.append(p)
            existing_ids[p["id"]] = len(data) - 1
            
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)

def get_all_products():
    if not os.path.exists(DB_FILE):
        return []
    with open(DB_FILE, "r") as f:
        return json.load(f)

def get_product_by_id(product_id: str):
    products = get_all_products()
    for p in products:
        if p["id"] == product_id:
            return p
    return None

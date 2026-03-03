from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import intelligence
import database

app = FastAPI(title="BuyWise API")

@app.get("/")
def read_root():
    return {"message": "Welcome to BuyWise API - Your Smart Shopping Assistant"}

@app.get("/search")
def search_products(query: str):
    # Phase 5 intelligence (Intent Extraction & Smart Ranking)
    intent = intelligence.extract_intent(query)
    
    # Phase 7 & 8: Fetch data from DB and rank it
    all_products = database.get_all_products()
    ranked_results = intelligence.rank_products(all_products, intent)
    
    return {
        "status": "success",
        "original_query": query,
        "understood_intent": intent,
        "results": ranked_results
    }

@app.get("/filter")
def filter_products(min_price: Optional[int] = None, max_price: Optional[int] = None, feature: Optional[str] = None):
    # TODO: Implement filtering logic against MongoDB
    return {
        "status": "success",
        "filters_applied": {
            "min_price": min_price,
            "max_price": max_price,
            "feature": feature
        },
        "filtered_results": []
    }

@app.get("/product/{product_id}")
def get_product(product_id: str):
    product = database.get_product_by_id(product_id)
    if product:
        return {
            "status": "success",
            "product_id": product_id,
            "product_details": product
        }
    raise HTTPException(status_code=404, detail="Product not found")

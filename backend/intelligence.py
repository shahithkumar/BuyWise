import re

def extract_intent(query: str):
    """
    Very basic V1 Intent Extraction
    Extracts budget constraints and focus areas from natural language.
    Examples: "Best gaming phone under 25k" -> budget=25000, feature='gaming'
    """
    query = query.lower()
    
    # Extract Budget
    # Match patterns like: "under 20k", "under 20000", "<20k"
    budget = None
    k_match = re.search(r'(\d+)\s*k', query)
    num_match = re.search(r'under\s*(\d{4,})', query)
    
    if k_match:
        budget = int(k_match.group(1)) * 1000
    elif num_match:
        budget = int(num_match.group(1))
 
    # Map Needs to Features
    feature = None
    if any(word in query for word in ["gaming", "performance", "fast"]):
        feature = "gaming"
    elif any(word in query for word in ["camera", "photo", "video"]):
        feature = "camera"
    elif any(word in query for word in ["battery", "backup", "long last"]):
        feature = "battery"

    return {
        "budget": budget,
        "feature_need": feature
    }

def rank_products(products: list, intent: dict):
    """
    Ranks products based on how well they match the extracted intent.
    V1 Logic:
    1. Filter out absolute dealbreakers (price way over budget)
    2. Score based on feature matching
    """
    ranked = []
    
    budget = intent.get("budget")
    desired_feature = intent.get("feature_need")

    for prod in products:
        score = 50 # Base score
        
        # Price constraint (strict filter for V1)
        if budget:
            if prod["price"] > budget * 1.1: # 10% wiggle room
                continue 
            
            # Closer to budget = slightly better score
            price_delta = budget - prod["price"]
            score += min(20, (price_delta / budget) * 20)

        # Feature boosting
        if desired_feature:
            if desired_feature in prod.get("tags", []):
                score += 30

        prod["match_score"] = round(score, 1)
        ranked.append(prod)

    # Sort descending by match score
    ranked.sort(key=lambda x: x["match_score"], reverse=True)
    return ranked

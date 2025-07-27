import os
import re
import asyncio
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, constr
from fastapi.middleware.cors import CORSMiddleware

import google.generativeai as genai
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# FastAPI + CORS
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://kairomed.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client over HTTPS
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Gemini AI fallback
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Pydantic models
class MedicineRequest(BaseModel):
    name: constr(min_length=1, max_length=100)

class MedicineResponse(BaseModel):
    use_case: str
    composition: str
    side_effects: str
    image_url: Optional[str] = None
    manufacturer: Optional[str] = None
    reviews: Optional[dict] = None

class AlternativeItem(BaseModel):
    medicine_name: str
    composition: str
    use_case: str
    side_effects: str
    image_url: Optional[str]
    manufacturer: Optional[str]
    reviews: dict

class AlternativesResponse(BaseModel):
    alternatives: List[AlternativeItem]

# Utility: clean & normalize names
def clean_name(name: str) -> str:
    n = name.lower()
    n = re.sub(r"\b\d+\s*mg\b", "", n)
    n = re.sub(r"[^a-z0-9 ]", "", n)
    return re.sub(r"\s+", " ", n).strip()

# Fallback to Gemini AI
# Fallback to Gemini AI
async def query_gemini(medicine_name: str) -> MedicineResponse:
    if not GEMINI_API_KEY:
        raise HTTPException(500, "Gemini API key not set")
    prompt = (
        f"Provide detailed information about the medicine '{medicine_name}':\n"
        "Use Case: [...]\n"
        "Composition: [...]\n"
        "Side Effects: [...]\n"
        "If unknown, say so."
    )
    model = genai.GenerativeModel("gemini-1.5-flash")
    resp = await asyncio.to_thread(model.generate_content, prompt)
    text = resp.text or ""
    
    # Initialize with empty strings instead of "Not available"
    use_case = composition = side_effects = ""
    
    # More robust line parsing
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
            
        # Split only on first colon
        parts = line.split(":", 1)
        if len(parts) != 2:
            continue
            
        key, value = parts[0].lower().strip(), parts[1].strip()
        
        if "use case" in key or "uses" in key:
            use_case = value
        elif "composition" in key or "ingredients" in key:
            composition = value
        elif "side effect" in key:
            side_effects = value
    
    # Use fallback text only if no value was found
    return MedicineResponse(
        use_case=use_case or "Information not found",
        composition=composition or "Information not found",
        side_effects=side_effects or "Information not found"
    )

# Primary info endpoint
@app.post("/medicine/info", response_model=MedicineResponse)
async def get_medicine_info(req: MedicineRequest):
    q = clean_name(req.name)

    # 1) Fuzzy‐search RPC
    rpc_res = supabase.rpc("search_medicine_trgm", {"query": q}).execute()
    data = rpc_res.data or []
    if data and data[0]:
        row = data[0]
        return MedicineResponse(
            use_case     = row["use_case"],
            composition  = row["composition"],
            side_effects = row["side_effects"],
            image_url    = row.get("image_url"),
            manufacturer = row.get("manufacturer"),
            reviews      = {
                "excellent": row.get("excellent_review"),
                "average":   row.get("average_review"),
                "poor":      row.get("poor_review")
            }
        )

    # 2) Fallback to Gemini
    return await query_gemini(req.name)

# New: Alternatives endpoint
@app.get("/medicine/alternatives", response_model=AlternativesResponse)
async def get_alternatives(name: str = Query(..., min_length=1, max_length=100)):
    q = clean_name(name)

    # 1) Fuzzy‐search RPC to find the base medicine
    rpc_res = supabase.rpc("search_medicine_trgm", {"query": q}).execute()
    data = rpc_res.data or []
    if not data or not data[0]:
        # Always return an object, never None
        return AlternativesResponse(alternatives=[])

    # 2) Extract salts
    composition = data[0]["composition"]
    original_med = data[0]["medicine_name"]

    salt_names = [
        s.split("(")[0].strip().lower()
        for s in re.split(r"\+|,", composition)
        if s.strip()
    ]
    if not salt_names:
        return AlternativesResponse(alternatives=[])

    # 3) Build filter string (no outer parentheses)
    or_filters = ",".join(f"composition.ilike.*{salt}*" for salt in salt_names)

    # 4) Query Supabase for alternates
    resp = supabase \
        .from_("medicine_info") \
        .select(
            "medicine_name, composition, uses, side_effects, image_url, manufacturer, excellent_review, average_review, poor_review"
        ) \
      .or_(or_filters) \
      .neq("medicine_name", original_med) \
        .order("excellent_review", desc=True) \
        .limit(5) \
        .execute()

    alt_data = resp.data or []

    # 5) Build list of AlternativeItem
    items: List[AlternativeItem] = []
    for row in alt_data:
        items.append(AlternativeItem(
            medicine_name = row["medicine_name"],
            composition   = row["composition"],
            use_case      = row["uses"],
            side_effects  = row["side_effects"],
            image_url     = row.get("image_url"),
            manufacturer  = row.get("manufacturer"),
            reviews       = {
                "excellent": row.get("excellent_review"),
                "average":   row.get("average_review"),
                "poor":      row.get("poor_review")
            }
        ))

    # 6) Return the response model
    return AlternativesResponse(alternatives=items)
import os
import re
import asyncio
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, constr
from fastapi.middleware.cors import CORSMiddleware

import google.generativeai as genai
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# FastAPI
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://kairomed.vercel.app"], allow_methods=["*"], allow_headers=["*"]
)

# Supabase client (REST over HTTPS)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Gemini AI fallback
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Models
class MedicineRequest(BaseModel):
    name: constr(min_length=1, max_length=100)

class MedicineResponse(BaseModel):
    use_case: str
    composition: str
    side_effects: str
    image_url: Optional[str] = None
    manufacturer: Optional[str] = None
    reviews: Optional[dict] = None

# Clean input
def clean_name(name: str) -> str:
    n = name.lower()
    n = re.sub(r"\b\d+\s*mg\b", "", n)
    n = re.sub(r"[^a-z0-9 ]", "", n)
    return re.sub(r"\s+", " ", n).strip()

# Gemini fallback
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
    use_case = composition = side_effects = "Not available"
    for line in text.splitlines():
        low = line.lower()
        if low.startswith("use case"):
            use_case = line.split(":",1)[1].strip()
        elif low.startswith("composition"):
            composition = line.split(":",1)[1].strip()
        elif low.startswith("side effects") or low.startswith("side effect"):
            side_effects = line.split(":",1)[1].strip()
    return MedicineResponse(use_case=use_case, composition=composition, side_effects=side_effects)

@app.post("/medicine/info", response_model=MedicineResponse)
async def get_medicine_info(req: MedicineRequest):
    q = clean_name(req.name)

    # 1) Fuzzy RPC call
    rpc_res = supabase \
      .rpc("search_medicine_trgm", {"query": q}) \
      .execute()

    data = rpc_res.data
    if data and isinstance(data, list) and data[0]:
        row = data[0]
        return MedicineResponse(
            use_case     = row["use_case"],
            composition  = row["composition"],
            side_effects = row["side_effects"],
            image_url    = row.get("image_url"),
            manufacturer = row.get("manufacturer"),
            reviews = {
              "excellent": row.get("excellent_review"),
              "average":   row.get("average_review"),
              "poor":      row.get("poor_review")
            }
        )

    # 2) Fallback to Gemini
    return await query_gemini(req.name)
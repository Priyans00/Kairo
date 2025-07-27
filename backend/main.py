# main.py
import os
import re
import asyncio
import asyncpg
from typing import Optional
import json

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, constr
from fastapi.middleware.cors import CORSMiddleware

import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# FastAPI setup
app = FastAPI(title="Medicine Info API", version="1.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://kairomed.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini (fallback AI) config
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Supabase Postgres connection string
DATABASE_URL = os.getenv("SUPABASE_DB_URL")
_pool: Optional[asyncpg.pool.Pool] = None

@app.on_event("startup")
async def startup():
    global _pool
    _pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)

@app.on_event("shutdown")
async def shutdown():
    await _pool.close()

# Request / response models
class MedicineRequest(BaseModel):
    name: constr(min_length=1, max_length=100)

class MedicineResponse(BaseModel):
    use_case: str
    composition: str
    side_effects: str
    image_url: Optional[str] = None
    manufacturer: Optional[str] = None
    reviews: Optional[dict] = None

# Clean and normalize the user’s input
def clean_name(name: str) -> str:
    n = name.lower()
    # strip dosage like “500 mg” or “250mg”
    n = re.sub(r"\b\d+\s*mg\b", "", n)
    # remove non-alphanumeric chars except spaces
    n = re.sub(r"[^a-z0-9 ]", "", n)
    return re.sub(r"\s+", " ", n).strip()

# Fallback to Gemini if DB has no good match
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
    # Simple parse by line prefix
    use_case = composition = side_effects = "Not available"
    for line in text.splitlines():
        low = line.lower()
        if low.startswith("use case"):
            use_case = line.split(":",1)[1].strip()
        elif low.startswith("composition"):
            composition = line.split(":",1)[1].strip()
        elif low.startswith("side effects") or low.startswith("side effect"):
            side_effects = line.split(":",1)[1].strip()
    return MedicineResponse(
        use_case=use_case,
        composition=composition,
        side_effects=side_effects
    )

@app.post("/medicine/info", response_model=MedicineResponse)
async def get_medicine_info(req: MedicineRequest):
    name = clean_name(req.name)

    # 1) Try fuzzy search in Supabase Postgres
    sql = """
      SELECT
        uses            AS use_case,
        composition,
        side_effects,
        image_url,
        manufacturer,
        json_build_object(
          'excellent', excellent_review,
          'average',   average_review,
          'poor',      poor_review
        ) AS reviews,
        similarity(medicine_name, $1) AS sim
      FROM medicine_info
      WHERE medicine_name % $1
      ORDER BY sim DESC
      LIMIT 1;
    """
    async with _pool.acquire() as conn:
        row = await conn.fetchrow(sql, name)

    # If similarity is strong enough, return DB result
    if row and row["sim"] > 0.2:
        row_dict = dict(row)
        if isinstance(row_dict.get("reviews"), str):
            row_dict["reviews"] = json.loads(row_dict["reviews"])

        return MedicineResponse(**row_dict)


    # 2) Otherwise, fall back to Gemini AI
    return await query_gemini(req.name)

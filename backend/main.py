import asyncio
import os
from typing import Optional
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, constr
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

# Load environment variables
load_dotenv()

# FastAPI app setup
app = FastAPI(
    title="Medicine Info API",
    description="Backend using Gemini 1.5 Flash to get medicine info",
    version="1.0.0"
)


origins = [
    "https://kairomed.vercel.app/",      # frontend URL
    "http://localhost:3000"              # Optional: local dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get Gemini API key from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("⚠️ Warning: GEMINI_API_KEY is not set. API won't work.")

# Pydantic request/response models
class MedicineRequest(BaseModel):
    name: constr(min_length=1, max_length=100, strip_whitespace=True)

class MedicineResponse(BaseModel):
    use_case: str
    composition: str
    side_effects: str

# Function to query Gemini model
async def query_gemini(medicine_name: str) -> MedicineResponse:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    prompt = (
        f"Provide detailed information about the medicine '{medicine_name}' in the following format:\n"
        "Use Case: [What it is used for]\n"
        "Composition: [Active ingredients]\n"
        "Side Effects: [Common and serious side effects]\n"
        "If the medicine is unknown, say it clearly."
    )

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = await asyncio.to_thread(model.generate_content, prompt)

        if not response.text:
            raise HTTPException(status_code=500, detail="Gemini API returned empty response")

        content = response.text.strip()
        use_case = composition = side_effects = "Information not available"

        for line in content.splitlines():
            line_lower = line.lower().strip()
            if "use case" in line_lower:
                use_case = line.split(":", 1)[-1].strip()
            elif "composition" in line_lower:
                composition = line.split(":", 1)[-1].strip()
            elif "side effect" in line_lower:
                side_effects = line.split(":", 1)[-1].strip()

        if "not recognized" in content.lower() or "unknown" in content.lower():
            raise HTTPException(status_code=404, detail=f"Medicine '{medicine_name}' not recognized")

        return MedicineResponse(
            use_case=use_case,
            composition=composition,
            side_effects=side_effects
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")

# API endpoint
@app.post("/medicine/info", response_model=MedicineResponse, summary="Get medicine information")
async def get_medicine_info(request: MedicineRequest):
    return await query_gemini(request.name)

# Local run
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)

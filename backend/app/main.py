from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.core import analyze_video_logic, analyze_text_logic, analyze_image_logic

app = FastAPI(title="AI-Detector Backend")

# Accepts url OR text (next addition is audio)
class AnalyzeRequest(BaseModel):
    url: Optional[str] = None
    text: Optional[str] = None

@app.get("/")
def health_check():
    return {"status": "active", "service": "AI-Detector"}

@app.post("/analyze")
async def analyze_content(request: AnalyzeRequest):
    """
    Smart Endpoint:
    - If 'url' is provided -> Video Analysis
    - If 'text' is provided -> Text Analysis
    """
    if request.url:
        print(f"Received Video Request: {request.url}")
        return await analyze_video_logic(request.url)
    
    elif request.text:
        print(f"Received Text Request: {request.text[:30]}...")
        return await analyze_text_logic(request.text)
    
    else:
        raise HTTPException(status_code=400, detail="Please provide either 'url' or 'text'")
    
class ImageRequest(BaseModel):
    url: str

@app.post("/analyze/image")
async def analyze_image_endpoint(request: ImageRequest):
    print(f"Received Image Request: {request.url}")
    return await analyze_image_logic(request.url)
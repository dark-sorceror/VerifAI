from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.core import analyze_video_logic

# Initialize the app
app = FastAPI(title="AI-Detector Backend")

# Define the expected JSON body
class VideoRequest(BaseModel):
    url: str

@app.get("/")
def health_check():
    """Simple health check for DigitalOcean"""
    return {"status": "active", "service": "AI-Detector AI"}

@app.post("/analyze")
async def analyze_video(request: VideoRequest):
    """
    Endpoint called by the Chrome Extension.
    Receives { "url": "..." } -> Returns Analysis JSON
    """
    try:
        return await analyze_video_logic(request.url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
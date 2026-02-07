import os
import json
import hashlib
import time
from dotenv import load_dotenv
from google import genai
from app.utils import download_and_process_video

# prints if it finds the file
load_dotenv(verbose=True)

# debugging
api_key = os.getenv("GEMINI_API_KEY")
print(f"🔑 DEBUG: Loaded API Key? {'YES' if api_key else 'NO - CHECK .ENV FILE!'}")


# redis connection
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
try:
    import redis
    cache = redis.from_url(redis_url, decode_responses=True)
    cache.ping()
    print("Connected to Real Redis")
except:
    # this is what will most likely happen, since no redis server is setup
    print("Using Fake Redis (In-Memory)")
    from fakeredis import FakeRedis
    cache = FakeRedis(decode_responses=True)

# gemini client
if not api_key:
    raise ValueError("CRITICAL: GEMINI_API_KEY not found in .env file. Please check your variable name.")

client = genai.Client(api_key=api_key)

async def analyze_video_logic(video_url: str):
    # cache check
    video_id = hashlib.md5(video_url.encode()).hexdigest()
    
    if cached := cache.get(video_id):
        print(f"⚡ Cache HIT: {video_url}")
        return json.loads(cached)

    print(f"🐢 Cache MISS: {video_url}. Starting analysis...")

    video_path = None
    try:
        # download video
        video_path = download_and_process_video(video_url)

        # upload video
        print("Uploading to Gemini...")
        
        video_file = client.files.upload(file=video_path)

        # processing poll
        while video_file.state.name == "PROCESSING":
            time.sleep(2)
            video_file = client.files.get(name=video_file.name)

        if video_file.state.name == "FAILED":
            raise ValueError("Gemini failed to process video.")

        # analysis
        print("Running Analysis...")
        
        prompt = """
        You are an AI-Detector, a digital forensics AI. Analyze this video for deepfakes.
        Return JSON ONLY:
        {
            "Detector_score": int (0-100),
            "verdict": "Real" | "Fake",
            "forensics": { "visual_anomalies": [], "audio_anomalies": [] },
            "content_analysis": { "logical_flaws": [], "sentiment": "" }
        }
        """

        # generate content to be returned
        response = client.models.generate_content(
            model="gemini-2.5-flash", # its important that we use this specific version (it works)
            contents=[prompt, video_file]
        )
        
        raw_text = response.text.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw_text)

        # caching
        cache.setex(video_id, 86400, json.dumps(result))
        return result

    except Exception as e:
        print(f"❌ Error: {e}")
        return {
            "AI-Detector_score": 0, "verdict": "Error",
            "forensics": {"visual_anomalies": [str(e)]},
            "content_analysis": {}
        }
    finally:
        if video_path and os.path.exists(video_path):
            os.remove(video_path)
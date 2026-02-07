import os
import json
import hashlib
import time
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from app.utils import download_and_process_video, extract_video_metadata

# force load env
BASE_DIR = Path(__file__).resolve().parent.parent 
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH, verbose=True)

# configure the key 
api_key = os.getenv("GEMINI_API_KEY")
print(f"DEBUG: Loaded API Key? {'YES' if api_key else 'NO'}") # print statement for testing

if not api_key:
    raise ValueError("CRITICAL: GEMINI_API_KEY not found in .env file.")

# init gemini client
client = genai.Client(api_key=api_key)

# init redis
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
try:
    import redis
    cache = redis.from_url(redis_url, decode_responses=True)
    cache.ping()
    print("Connected to Real Redis")
except:
    print("Using Fake Redis (In-Memory)")
    from fakeredis import FakeRedis
    cache = FakeRedis(decode_responses=True)


async def analyze_video_logic(video_url: str):
    # cache check
    video_id = hashlib.md5(video_url.encode()).hexdigest()
    
    if cached := cache.get(video_id):
        print(f"Cache hit: {video_url}")
        return json.loads(cached)

    print(f"Cache miss: {video_url}. Starting analysis...")

    video_path = None
    try:
        video_path = download_and_process_video(video_url)

        # metadata scan
        print("🔍 Scanning Metadata...")
        metadata_result = extract_video_metadata(video_path)

        # error level analysis scan
        print("🔬 Running Error Level Analysis (ELA)...")
        ela_result = perform_ela_analysis(video_path)

        # store summary of metadata, so gemini has more to work off of
        metadata_summary = f"Metadata Findings: Encoder={metadata_result.get('encoder')}, Suspicious Flags={metadata_result.get('suspicious_indicators')}"

        # store summary of ela, so gemini has even more to go off of
        ela_summary = f"ELA Analysis: Score={ela_result.get('ela_score')}, Interpretation={ela_result.get('interpretation')}"

        # send to gemini
        print("Uploading to Gemini...")
        video_file = client.files.upload(file=video_path)

        while video_file.state.name == "PROCESSING":
            time.sleep(2)
            video_file = client.files.get(name=video_file.name)

        if video_file.state.name == "FAILED":
            raise ValueError("Gemini failed to process video.")

        if video_file.state.name == "FAILED":
            raise ValueError("Gemini failed to process video.")

        # analysis
        print("Running Analysis...")
        prompt = f"""
        You are a Digital Forensics Expert. Analyze this video for AI generation.
        
        [HARD EVIDENCE]:
        1. {metadata_summary}
        2. {ela_summary}
        
        Step 1: Analyze the Physics. Do objects move naturally? Is gravity respected?
        Step 2: Analyze the Anatomy. Are hands/fingers consistent? Do eyes blink naturally?
        Step 3: Analyze the Logic. Is the human behavior survival-oriented and rational?
        Step 4: Analyze the Textures. Is skin too smooth? Is lighting consistent?

        Step 5: Synthesize a Verdict. IF there are strong logical or physical flaws, the video is likely FAKE, even if it looks visually high-quality.

        Return JSON ONLY:
        {{
            "thinking_process": "Summarize your step-by-step analysis here...",
            "veritas_score": int (0-100),
            "verdict": "Real" | "Fake" | "Uncertain",
            "forensics": {{ "visual_anomalies": [], "audio_anomalies": [] }},
            "content_analysis": {{ "logical_flaws": [], "sentiment": "" }}
        }}
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, video_file]
        )
        
        raw_text = response.text.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw_text)

        # put metadata into final JSON
        result["hard_science"] = {
            "metadata_scan": metadata_result,
            "ela_scan": ela_result
        }

        cache.setex(video_id, 86400, json.dumps(result))
        return result

    except Exception as e:
        print(f"Error: {e}")
        return {
            "Detector_score": 0, "verdict": "Error",
            "forensics": {"error": str(e)},
            "content_analysis": {}
        }
    finally:
        if video_path and os.path.exists(video_path):
            os.remove(video_path)

# analyze text
async def analyze_text_logic(text_content: str):
    # cache test
    text_id = hashlib.md5(text_content.encode()).hexdigest()
    
    if cached := cache.get(text_id):
        print(f"Text Cache HIT")
        return json.loads(cached)

    print(f"Text Cache MISS. Analyzing...")

    try:
        # gemini analysis
        prompt = """
        You are an AI-Detector. Analyze this text to determine if it was generated by an AI/LLM.
        Look for: overly formal tone, lack of personal anecdote, repetitive sentence structure, and 'hallucination' patterns.

        Return JSON ONLY:
        {
            "Detector_score": int (0-100, where 100 is definitely AI),
            "verdict": "Human" | "AI-Generated" | "Mixed",
            "content_analysis": {
                "writing_style": "Formal/Casual/Robotic",
                "indicators": ["list of specific phrases or patterns found"]
            }
        }
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, text_content]
        )
        
        # clean JSON
        raw_text = response.text.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw_text)

        # cache result :)
        cache.setex(text_id, 86400, json.dumps(result))
        return result

    except Exception as e:
        print(f"Text Error: {e}")
        return {
            "Detector_score": 0, "verdict": "Error",
            "content_analysis": {"error": str(e)}
        }
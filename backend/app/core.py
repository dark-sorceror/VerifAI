import os
import json
import hashlib
import time
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from app.utils import (
    download_and_process_video, 
    extract_video_metadata, 
    perform_ela_analysis, 
    analyze_frame_consistency,
    download_image, 
    extract_image_metadata, 
    perform_image_ela
)

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
        print("Scanning Metadata...")
        metadata_result = extract_video_metadata(video_path)

        # error level analysis scan
        print("Running Error Level Analysis (ELA)...")
        ela_result = perform_ela_analysis(video_path)

        # frame consistency 
        print("Analyzing Movement Consistency...")
        movement_result = analyze_frame_consistency(video_path)

        # store summary of metadata, so gemini has more to work off of
        metadata_summary = f"Metadata Findings: Encoder={metadata_result.get('encoder')}, Suspicious Flags={metadata_result.get('suspicious_indicators')}"

        # store summary of ela, so gemini has even more to go off of
        ela_summary = f"ELA Analysis: Score={ela_result.get('ela_score')}, Interpretation={ela_result.get('interpretation')}"

        # store summary of frame movement
        movement_summary = f"Movement Stability: Variance={movement_result.get('flux_score')}, AvgFlux={movement_result.get('avg_movement')}"

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
        You are a Digital Forensics Expert. Your job is to distinguish between AI-generated videos (Sora, Runway, Pika) and Real videos.
        
        [HARD EVIDENCE]:
        1. {metadata_summary}
        2. {ela_summary}
        3. {movement_summary}
        
        [CRITICAL RULES]:
        1. **The "Watermark" Kill Switch:** If you see a watermark or text saying "Sora", "OpenAI", "Runway", "Pika", or "Kling" -> IT IS 100% FAKE. Do not overthink it.
        2. **ELA Thresholds:**
           - Score < 1.0: EXTREMELY suspicious. Likely AI (Sora/Runway) or heavy blur.
           - Score 1.2 - 2.0: Common for compressed YouTube videos (Real).
           - Score > 2.0: Natural camera noise (Real).
        3. **Physics vs. Texture:**
           - Sora/Gen-3 models have PERFECT physics (gravity, collisions). Do not be fooled by good physics.
           - Look closer at TEXTURES: Is the skin waxy? Do background text characters morph?
        
        [THE LOGIC TRAP]:
        - Do not assume a video is "Real" just because the physics are good. Current AI (Sora) has mastered physics.
        - Instead, look for "Dream Logic" (e.g., a trash can appearing out of nowhere, or a cat melting into a wall).
        
        Step 1: SEARCH FOR WATERMARKS. If found, verdict is FAKE immediately.
        Step 2: Analyze Textures & ELA. Is ELA < 1.1? If so, be very skeptical.
        Step 3: Analyze Physics.
        Step 4: Synthesize Verdict.

        Return JSON ONLY:
        {{
            "thinking_process": "Step-by-step reasoning...",
            "ai_probability": int (0-100, where 100 is DEFINITELY AI. If 'Sora' watermark found, set 100.),
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
            "ela_scan": ela_result,
            "movement_scan": movement_result
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
    
async def analyze_image_logic(image_url: str):
    # cache check
    image_id = hashlib.md5(image_url.encode()).hexdigest()
    if cached := cache.get(image_id):
        print(f"Image Cache HIT: {image_url}")
        return json.loads(cached)

    print(f"Image Cache MISS: {image_url}. Starting analysis...")
    
    image_path = None
    try:
        image_path = download_image(image_url)
        
        # 2. Hard Science (Metadata + ELA)
        print("🔍 Scanning Image Metadata...")
        meta_result = extract_image_metadata(image_path)
        
        print("🔬 Running Image ELA...")
        ela_result = perform_image_ela(image_path)
        
        # Summaries for Gemini
        meta_summary = f"Metadata: Camera={meta_result.get('make')} {meta_result.get('model')}, Software={meta_result.get('software')}"
        ela_summary = f"ELA Score: {ela_result.get('ela_score')} ({ela_result.get('interpretation')})"
        
        # 3. Upload to Gemini
        print("Uploading to Gemini...")
        image_file = client.files.upload(file=image_path)
        
        # 4. Analysis Prompt (to add: trained LLM input on the matter - or rather, replacing this section as a whole with the trained LLM)
        print("Running Gemini Vision...")
        prompt = f"""
        You are a Digital Forensics Expert. Analyze this IMAGE for AI generation.
        
        [HARD EVIDENCE]:
        1. {meta_summary}
        2. {ela_summary}
        
        [CRITICAL CONTEXT]:
        1. **Stock Photo Warning:** High-quality stock photos (Unsplash, Pexels, Getty) often have STRIPPED metadata and LOW ELA scores due to compression/editing.
           - DO NOT assume "No Metadata" + "Smoothness" = AI automatically.
        2. **The "Anatomy" Check:** AI generation fails at details. Look for:
           - Animal paws (fused toes, wrong number of claws).
           - Text (gibberish/alien symbols).
           - Eyes (pupils that aren't round, mismatched reflections).
           - Blending (objects melting into each other).
        3. **Verdict Logic:**
           - If Anatomy/Physics is FLAWLESS -> Verdict is REAL (likely a Stock Photo), even if ELA is low.
           - If Anatomy has errors (6 fingers, floating objects, weird paws) -> Verdict is FAKE.
           - If ELA is Low (< 1.5) AND you see "Glossy/Plastic" skin/fur -> Verdict is FAKE.

        Step 1: Analyze Anatomy (Hands, Paws, Eyes). Any errors?
        Step 2: Analyze Textures. Is it "Plastic" (AI) or "Natural" (Real)?
        Step 3: Synthesize Verdict.
           - Perfect Anatomy + Low ELA = likely Real (Processed/Stock).
           - Flawed Anatomy + Low ELA = definitely AI.

        Return JSON ONLY:
        {{
            "thinking_process": "Reasoning...",
            "ai_probability": int (0-100),
            "verdict": "Real" | "Fake" | "Uncertain",
            "forensics": {{ "visual_anomalies": [] }}
        }}
        """
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, image_file]
        )
        
        raw_text = response.text.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw_text)
        
        # Inject Hard Science
        result["hard_science"] = {
            "metadata": meta_result,
            "ela": ela_result
        }
        
        cache.setex(image_id, 86400, json.dumps(result))
        return result

    except Exception as e:
        print(f"Image Error: {e}")
        return {"verdict": "Error", "error": str(e)}
        
    finally:
        if image_path and os.path.exists(image_path):
            os.remove(image_path)
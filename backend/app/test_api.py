import requests
import json
import time

# The URL of your local server
API_URL = "http://127.0.0.1:8000/analyze"

# "Me at the zoo" - The oldest video on YouTube (19 seconds, guaranteed to work)
TEST_VIDEO = "https://www.youtube.com/watch?v=jNQXAC9IVRw&vl=en"

def test_AIDetector():
    print(f"Sending request to AI-Detector for: {TEST_VIDEO}")
    print("⏳ This might take 5-15 seconds (Download + Gemini processing)...")
    
    start_time = time.time()
    
    try:
        response = requests.post(API_URL, json={"url": TEST_VIDEO})
        response.raise_for_status() # Raise error if status is not 200
        data = response.json()
        
        elapsed = time.time() - start_time
        
        print("\n✅ ANALYSIS COMPLETE!")
        print(f"⏱️ Time taken: {elapsed:.2f} seconds")
        print("-" * 30)
        print(json.dumps(data, indent=2))
        print("-" * 30)
        
        if elapsed < 2:
            print("⚡ That was fast! It was likely a CACHE HIT.")
        else:
            print("🐢 That took a while. It was a CACHE MISS (Fresh Analysis).")

    except Exception as e:
        print(f"\n❌ FAILED: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
             print(f"Server Response: {e.response.text}")

if __name__ == "__main__":
    test_AIDetector()
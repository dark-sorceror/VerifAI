import requests
import json
import time

API_URL = "http://127.0.0.1:8000/analyze"

# An example video from X (Twitter)
TEST_VIDEO = "https://x.com/JamianGerard/status/1877370951488135406" # <- fake, 5s vid from X, Test result: Pass!
# TEST_VIDEO = "https://www.instagram.com/zebracat.ai/reel/DSe95-7iaR2/?hl=en" # <- fake vid from insta, Test result: success

def test_social_media():
    print(f"TESTING SOCIAL MEDIA SUPPORT (X/Twitter)")
    print(f"Target: {TEST_VIDEO}")
    
    try:
        start = time.time()
        response = requests.post(API_URL, json={"url": TEST_VIDEO})
        data = response.json()
        duration = time.time() - start
        
        print(f"\nAnalysis Complete in {duration:.2f}s")
        print("-" * 40)
        print(f"VERDICT: {data.get('verdict')} (AI Probability: {data.get('ai_probability')}%)")
        
        hs = data.get("hard_science", {})
        print(f"Metadata: {hs.get('metadata_scan', {}).get('encoder')}")
        print(f"Flux Variance: {hs.get('movement_scan', {}).get('flux_score')}")
        
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_social_media()
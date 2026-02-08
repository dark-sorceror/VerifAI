import requests
import json
import time

API_URL = "http://127.0.0.1:8000/analyze"
TEST_VIDEO = "https://www.youtube.com/shorts/AcF7BcG3q5E"

def test_everything():
    print(f"STARTING FULL SYSTEM TEST")
    print(f"Target: {TEST_VIDEO}")
    print("-" * 40)
    
    start = time.time()
    
    try:
        response = requests.post(API_URL, json={"url": TEST_VIDEO})
        data = response.json()
        duration = time.time() - start
        
        print(f"Analysis Complete in {duration:.2f}s")
        print("-" * 40)
        
        # 1. Check Gemini Verdict
        print(f"GEMINI VERDICT: {data.get('verdict')} (AI Probability: {data.get('ai_probability')}%)")
        hs = data.get("hard_science", {})
        
        print("\nMETADATA:")
        print(f"   Encoder: {hs.get('metadata_scan', {}).get('encoder')}")
        
        print("\nELA (Visuals):")
        print(f"   Score: {hs.get('ela_scan', {}).get('ela_score')}")
        
        print("\nFLUX (Movement):")
        print(f"   Variance: {hs.get('movement_scan', {}).get('flux_score')}")
        
        print("-" * 40)
        print("GEMINI THOUGHT PROCESS:")
        print(data.get("thinking_process", "No thinking process returned."))
        
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_everything()
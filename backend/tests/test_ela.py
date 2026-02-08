import requests
import json
import time

# local server url
API_URL = "http://127.0.0.1:8000/analyze"

# "Me at the zoo" - Real, low-quality footage (results should yield have HIGH noise/grain)
TEST_VIDEO = "https://www.youtube.com/watch?v=jNQXAC9IVRw"

def test_ela_feature():
    print(f"TESTING MILESTONE 2: Error Level Analysis (ELA)")
    print(f"Target: {TEST_VIDEO}")
    print("Processing... (Downloading -> Extracting Frame -> Calculating ELA)")
    
    try:
        start_time = time.time()
        response = requests.post(API_URL, json={"url": TEST_VIDEO})
        response.raise_for_status()
        data = response.json()
        elapsed = time.time() - start_time
        
        print(f"\nAPI Response Received in {elapsed:.2f}s")
        
        # Check for the new "hard_science" section
        if "hard_science" in data and "ela_scan" in data["hard_science"]:
            ela = data["hard_science"]["ela_scan"]
            
            print("\nELA RESULTS:")
            print(f"   - Valid: {ela.get('valid')}")
            print(f"   - ELA Score (Mean Noise): {ela.get('ela_score')}")
            print(f"   - Max Difference: {ela.get('max_difference')}")
            print(f"   - Interpretation: {ela.get('interpretation')}")
            
            # Logic check
            score = ela.get('ela_score', 0)
            if score > 2.0:
                print("\nSUCCESS: High noise detected (Expected for this old video).")
            else:
                print("\nNOTE: Low noise detected. (Unexpected for this video, but code is working).")
                
        else:
            print("\nFAILED: 'ela_scan' missing from JSON response.")
            print("Did you update 'analyze_video_logic' in core.py to include 'ela_result'?")
            print(json.dumps(data, indent=2))

    except Exception as e:
        print(f"\nCRITICAL FAILURE: {e}")

if __name__ == "__main__":
    test_ela_feature()
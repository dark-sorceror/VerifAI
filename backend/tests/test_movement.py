import requests
import json
import time

API_URL = "http://127.0.0.1:8000/analyze"
# "Me at the zoo" again - Low quality, lots of movement
TEST_VIDEO = "https://www.youtube.com/watch?v=jNQXAC9IVRw"

def test_movement_feature():
    print(f"TESTING MILESTONE 3: Frame Consistency")
    print(f"Target: {TEST_VIDEO}")
    
    try:
        start_time = time.time()
        response = requests.post(API_URL, json={"url": TEST_VIDEO})
        data = response.json()
        elapsed = time.time() - start_time
        
        print(f"\nAPI Response Received in {elapsed:.2f}s")
        
        if "hard_science" in data and "movement_scan" in data["hard_science"]:
            mov = data["hard_science"]["movement_scan"]
            print("\nMOVEMENT RESULTS:")
            print(f"   - Flux Score (Variance): {mov.get('flux_score')}")
            print(f"   - Average Flux: {mov.get('avg_movement')}")
            print(f"   - Interpretation: {mov.get('interpretation')}")
            
            if mov.get("valid"):
                print("\nPASSED: Movement analysis successful.")
            else:
                print(f"\nFAILED: Analysis invalid - {mov.get('error')}")
        else:
            print("\nFAILED: 'movement_scan' missing from JSON.")

    except Exception as e:
        print(f"CRITICAL FAILURE: {e}")

if __name__ == "__main__":
    test_movement_feature()
import requests
import json
import time

API_URL = "http://127.0.0.1:8000/analyze"
TEST_VIDEO = "https://www.youtube.com/watch?v=jNQXAC9IVRw" # first yt video ever

def test_metadata_feature():
    print(f"TESTING MILESTONE 1: Metadata Extraction")
    
    try:
        response = requests.post(API_URL, json={"url": TEST_VIDEO})
        data = response.json()
        
        if "hard_science" in data:
            meta = data["hard_science"]["metadata_scan"]
            print("\nFULL METADATA RESULT:")
            print(json.dumps(meta, indent=2))
            
            if meta.get("valid") is False:
                 print("\nMetadata Scan Failed (See error above)")
            else:
                 print("\nMetadata Scan Successful")
        else:
            print("\'hard_science' missing.")
            
    except Exception as e:
        print(f"CRITICAL FAILURE: {e}")

if __name__ == "__main__":
    test_metadata_feature()
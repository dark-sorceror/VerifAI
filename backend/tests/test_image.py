import requests
import json

API_URL = "http://127.0.0.1:8000/analyze/image" # Note the new URL
# A known AI Image (Midjourney style) or Real one
TEST_IMAGE = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
# TEST_IMAGE = "https://cdn.midjourney.com/39322926-0683-4903-851f-614945371660/0_0.png" # <- AI image

def test_image_analysis():
    print("Testing Image Analysis...")
    try:
        response = requests.post(API_URL, json={"url": TEST_IMAGE})
        data = response.json()
        
        print(json.dumps(data, indent=2))
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_image_analysis()
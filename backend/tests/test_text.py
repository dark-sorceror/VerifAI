import requests
import json

# The URL of your local server
API_URL = "http://127.0.0.1:8000/analyze"

# 🤖 This is obviously AI-generated text
AI_SAMPLE = """
In the rapidly evolving landscape of digital transformation, leveraging synergistic paradigms is essential for optimizing operational efficiencies. By utilizing robust frameworks, organizations can seamlessly integrate scalable solutions that drive innovation and foster sustainable growth.
"""

# 🙋 This is obviously human text
HUMAN_SAMPLE = "Yo bro, im going to the store to grab some milk, want anything? text me back asap"

def test_text_analysis():
    print("TEST 1: Sending AI Text...")
    response = requests.post(API_URL, json={"text": AI_SAMPLE})
    print(json.dumps(response.json(), indent=2))
    print("-" * 40)

    print("\nTEST 2: Sending Human Text...")
    response = requests.post(API_URL, json={"text": HUMAN_SAMPLE})
    print(json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    test_text_analysis()
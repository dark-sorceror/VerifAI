import re
import os
import json
import base64
from google import genai 
from flask_cors import CORS
from google.genai import types
from flask import Flask, request, jsonify

app = Flask(__name__)
CORS(app)

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def extract_pure_json(text):
    text = text.strip()

    try:
        if text.startswith("{") and text.endswith("}"):
            return json.loads(text)
    except json.JSONDecodeError:
        pass

    try:
        match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        
        if match:
            return json.loads(match.group(1))
    except json.JSONDecodeError:
        pass

    try:
        start_idx = text.find('{')
        end_idx = text.rfind('}')
        
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            clean_string = text[start_idx : end_idx + 1]
            
            return json.loads(clean_string)
    except Exception as e:
        print(f"Failed all JSON extraction attempts. Error: {e}")
        
    return None

@app.route('/analyze', methods=['POST'])
def analyze_content():
    data = request.json
    image_input = data.get('image') or data.get('file')
    text_input = data.get('text')

    if not image_input and not text_input:
        return jsonify({"error": "No content provided"}), 400

    try:
        model_name = "gemini-2.5-flash"
        contents = []

        if image_input:
            if "," in image_input:
                image_input = image_input.split(",")[1]
                
            image_bytes = base64.b64decode(image_input)
            contents.append(types.Part.from_bytes(
                data = image_bytes, 
                mime_type = "image/png"
            ))

        if text_input:
            contents.append(text_input)

        system_instruction = "You are a Fact-Checking System. Use Google Search to verify claims. You MUST respond ONLY with valid JSON."
        final_prompt = """
        Analyze this image/text. Break down your findings.
        Return EXACTLY this JSON structure:
        {
            "score": 50,
            "label": "Unverified",
            "reasoning_points": [
                {
                    "title": "Claim: <text>", 
                    "detail": "Verdict: <text>",
                    "bullets": ["<fact 1>"]
                }
            ],
            "sources": [
                {"site_name": "nytimes.com", "url": "<Put the link here>"}
            ]
        }
        """
        contents.append(final_prompt)

        search_tool = types.Tool(google_search=types.GoogleSearch())

        response = client.models.generate_content(
            model = model_name,
            contents = contents,
            config = types.GenerateContentConfig(
                system_instruction = system_instruction,
                tools = [search_tool],
                temperature = 0.1
            )
        )
        
        try:
            clean_text = response.text.strip()
            
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
                
            result = json.loads(clean_text.strip())
        except Exception as e:
            print("Failed to parse JSON directly:", e)
            
            result = {"score": 0, "label": "Error", "reasoning_points": [{"title": "Error", "detail": "Could not parse API output."}], "sources": []}

        if "reasoning_points" not in result:
            result["reasoning_points"] = [{"title": "Analysis", "detail": "Verified but details missing."}]
        elif not isinstance(result["reasoning_points"], list):
            result["reasoning_points"] = [{"title": "Analysis", "detail": str(result["reasoning_points"])}]

        return jsonify(result)

    except Exception as e:
        print(f"Server Route Error: {str(e)}")
        
        return jsonify({
            "score": 0, "label": "High Risk",
            "reasoning_points": [{"title": "Crash", "detail": "Backend server crash."}], 
            "sources": []
        }), 500

if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 5000)
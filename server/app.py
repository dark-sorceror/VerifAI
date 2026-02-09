import os
import json
import base64
from flask import Flask, request, jsonify
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai 
from google import genai 
from google.genai import types

app = Flask(__name__)
CORS(app)

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

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
            contents.append(types.Part.from_bytes(data=image_bytes, mime_type="image/png"))

        if text_input:
            contents.append(text_input)

        system_instruction = """
        You are an advanced Forensic Fact-Checker and Social Media Analyst. 
        Your goal is to evaluate the TRUSTWORTHINESS of the provided content.
        
        1. TEXT EXTRACTION: Read all text in the image (tweet content, handles, timestamps).
        2. VISUAL ANALYSIS: Identify the person in the image, the organization in the background, and any UI anomalies.
        3. SOURCE AUDIT: Evaluate the reputation of the account (e.g., handles known for misinformation).
        4. VERIFICATION: Cross-reference the claims (e.g., Check if the person in the image actually made that statement).
        """

        final_prompt = """
        Perform a deep analysis. Look for inflammatory language, mismatched captions, or AI-generated text patterns.
        
        Return ONLY a raw JSON object with this structure:
        {
            "score": (integer 0-100, where 0 is DISINFORMATION and 100 is FULLY TRUSTWORTHY),
            "verdict": "Verified" | "Suspicious" | "Misinformation" | "AI-Generated",
            "reasoning": "Explain the text extracted, who the person is (e.g. Mark Carney), and if the claim matches reality.",
            "sources": ["List of URLs or names of actual events if found, or []"],
            "indicators": ["e.g., 'Inflammatory tone', 'Verified account handle', 'Historical mismatch'"]
        }
        """
        contents.append(final_prompt)

        response = client.models.generate_content(
            model=model_name,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json"
            )
        )
        
        result = json.loads(response.text)
        
        if "sources" not in result or not isinstance(result["sources"], list):
            result["sources"] = []
            
        return jsonify(result)

    except Exception as e:
        print(f"Server Error: {str(e)}")
        
        return jsonify({
            "score": 0, 
            "reasoning": f"Analysis failed: {str(e)}", 
            "sources": []
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
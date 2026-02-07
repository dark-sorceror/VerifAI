import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai 
from google.genai import types

app = Flask(__name__)
CORS(app)

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

@app.route('/analyze', methods=['POST'])
def analyze_tweet():
    data = request.json
    tweet_text = data.get('text')

    if not tweet_text:
        return jsonify({"error": "No text provided"}), 400

    try:
        prompt = f"""
        You are a fact-checker. Analyze this text: "{tweet_text}"
        Return ONLY a raw JSON object (no markdown formatting) with this structure:
        {{
            "score": (integer 0-100),
            "reasoning": (string, short explanation),
            "sources": (list of strings or ["None found"])
        }}
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json" 
            )
        )
        
        result = json.loads(response.text)
        
        return jsonify(result)

    except Exception as e:
        print(f"!!! SERVER ERROR !!!: {str(e)}")
        
        return jsonify({"error": "Analysis failed", "details": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    
    app.run(host='0.0.0.0', port=port)
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

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
            "sources": (list of strings, verifyable URLs)
        }}
        """
        
        response = model.generate_content(prompt)
        
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        
        result = json.loads(clean_text)
        
        return jsonify(result)

    except Exception as e:
        print(f"Error: {e}")
        
        return jsonify({"error": "Failed to analyze tweet"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
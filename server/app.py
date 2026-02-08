import os
import json
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai 
from google.genai import types

app = Flask(__name__)
CORS(app)

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

@app.route('/analyze', methods=['POST'])
def analyze_content():
    data = request.json
    
    text_input = data.get('text')
    image_input = data.get('image') or data.get('file')

    if not text_input and not image_input:
        return jsonify({"error": "No content provided"}), 400

    try:
        model_name = "gemini-2.5-flash"
        contents = []

        if text_input:
            contents.append(text_input)

        if image_input:
            try:
                if "," in image_input:
                    image_input = image_input.split(",")[1]
                
                image_bytes = base64.b64decode(image_input)
                contents.append(types.Part.from_bytes(
                    data=image_bytes,
                    mime_type="image/png"
                ))
            except Exception as e:
                return jsonify({"error": "Invalid image data", "details": str(e)}), 400

        system_instruction = """
        You are a forensic fact-checker and AI detector. 
        If an image is provided: Extract text and look for visual anomalies (font/layout artifacts).
        If text is provided: Analyze tone, perplexity, and structure.
        Always look for 'hallucination' patterns or lack of personal anecdote.
        """

        final_prompt = """
        Analyze the authenticity of the provided content. 
        Return ONLY a raw JSON object with this exact structure:
        {
            "score": (integer 0-100, where 100 is highly likely AI/Fake),
            "verdict": "Human" | "AI-Generated" | "Mixed" | "Unsure",
            "reasoning": "Brief explanation",
            "sources": ["List of strings or an empty list [] if none"],
            "indicators": ["list of specific flags found"]
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
            "verdict": "Error",
            "reasoning": f"Backend Error: {str(e)}",
            "sources": [],
            "indicators": ["connection_error"]
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    
    app.run(host='0.0.0.0', port=port)
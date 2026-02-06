import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/test', methods=['POST'])
def test():
    return jsonify({"test": "test"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
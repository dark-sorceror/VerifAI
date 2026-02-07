# AI Detector

Backend Setup
1. Navigate to the backend folder
cd backend

2. Create and activate a virtual environment
Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

3. Install dependencies
pip install -r requirements.txt

4. Set up environment variables

Create a .env file inside the backend/ folder and add the following:

GEMINI_API_KEY=your_google_api_key_here
REDIS_URL=redis://localhost:6379

5. Run the server
uvicorn app.main:app --reload


The server will start at:

http://127.0.0.1:8000

6. Test the API

Open a new terminal and run:

python test_api.py
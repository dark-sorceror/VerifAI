# Python 3.11 for best compatibility with AI libraries (fast)
FROM python:3.11-slim

# Install system dependencies -> ffmpeg: for video processing -> git: for python package installations
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port 8080 (DigitalOcean's default)
EXPOSE 8080

# Start the server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
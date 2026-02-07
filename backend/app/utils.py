import yt_dlp
import uuid
import os

def download_and_process_video(url: str) -> str:
    """
    Downloads video from a URL.
    Tries to find a pre-merged MP4 to avoid requiring FFmpeg for merging.
    """
    filename = f"/tmp/{uuid.uuid4()}.mp4"
    
    # Ensure the temp directory exists
    os.makedirs("/tmp", exist_ok=True)
    
    ydl_opts = {
        #prefer mp4, but take anything best if mp4 fails
        'format': 'best[ext=mp4]/best',
        'outtmpl': filename,
        'noplaylist': True,
        'quiet': True,
        'overwrites': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        return filename
    except Exception as e:
        if os.path.exists(filename):
            os.remove(filename)
        raise RuntimeError(f"Video download failed: {str(e)}")
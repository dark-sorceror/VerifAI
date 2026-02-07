def perform_ela_analysis(video_path: str) -> dict:
    """
    Extracts a frame, performs Error Level Analysis (ELA), 
    and calculates a 'Noise Consistency Score'.
    """
    try:
        # 1. Extract a frame from the middle of the video
        cap = cv2.VideoCapture(video_path)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_count // 2) # Jump to middle
        ret, frame = cap.read()
        cap.release()

        if not ret:
            return {"valid": False, "error": "Could not extract frame"}

        # 2. Convert to PIL Image
        # OpenCV uses BGR, PIL uses RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        original = Image.fromarray(frame_rgb)

        # 3. Perform ELA
        # Save compressed version to a temp buffer (simulated)
        import io
        buffer = io.BytesIO()
        original.save(buffer, "JPEG", quality=90)
        buffer.seek(0)
        compressed = Image.open(buffer)

        # 4. Calculate Difference (The ELA)
        ela_image = ImageChops.difference(original, compressed)
        
        # 5. Calculate Statistics (The "Score")
        extrema = ela_image.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        
        # Convert to numpy to get average noise level
        ela_np = np.array(ela_image)
        mean_noise = np.mean(ela_np)

        # AI visuals tend to have lower ELA noise (too smooth) or specific high-contrast edges
        # This is a heuristic: Real photos usually have higher, uniform noise.
        
        return {
            "valid": True,
            "ela_score": float(mean_noise),
            "max_difference": int(max_diff),
            "interpretation": "Low noise (Smooth/Artificial)" if mean_noise < 2.0 else "High noise (Natural/Grainy)"
        }

    except Exception as e:
        return {"valid": False, "error": str(e)}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeImageWithBackend = analyzeImageWithBackend;
async function analyzeImageWithBackend(base64Image) {
    try {
        const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const response = await fetch("http://127.0.0.1:5000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                file: cleanBase64,
                type: "image",
            }),
        });
        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }
        const data = (await response.json());
        return {
            score: data.score ?? 0,
            label: data.label ?? "Unknown",
            reasoning_points: data.reasoning_points ?? [],
            sources: data.sources ?? [],
        };
    }
    catch (error) {
        console.error("Backend Error:", error);
        return {
            score: 0,
            label: "Error",
            reasoning_points: [
                {
                    title: "Connection Failed",
                    detail: "Error connecting to server. Please check your internet connection.",
                },
            ],
            sources: [],
        };
    }
}

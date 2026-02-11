import { AnalysisResult } from "../../src/types";

interface BackendResponse {
    score?: number;
    label?: string;
    reasoning_points?: { title: string; bullets?: string[]; detail?: string }[];
    sources?: string[];
}

export async function analyzeImageWithBackend(
    base64Image: string,
): Promise<AnalysisResult> {
    try {
        const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

        const response = await fetch(
            "https://plankton-app-p8a82.ondigitalocean.app/analyze",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    file: cleanBase64,
                    type: "image",
                }),
            },
        );

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = (await response.json()) as BackendResponse;

        return {
            score: data.score ?? 0,
            label: data.label ?? "Unknown",
            reasoning_points: data.reasoning_points ?? [],
            sources: data.sources ?? [],
        };
    } catch (error) {
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

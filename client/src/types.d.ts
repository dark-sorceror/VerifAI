export interface AnalysisResult {
    score: number;
    reasoning: string;
    sources: string[];
}

export interface SnipCoordinates {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface SnipPayload {
    image: string;
    crop: SnipCoordinates;
}

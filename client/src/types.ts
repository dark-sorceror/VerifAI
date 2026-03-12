export interface AnalysisResult {
    score?: number;
    label?: string;
    reasoning_points?: { title: string; bullets?: string[]; detail?: string }[];
    sources?: string[];
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

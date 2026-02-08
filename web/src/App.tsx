import { useState } from "react";
import { UploadZone } from "./components/Upload";
import { ResultsDisplay } from "./components/Results";
import { Shield, Zap, Lock, Search, Chrome, X, ArrowRight } from "lucide-react";

export interface AnalysisResult {
    trustScore: number;
    file: File;
    fileName: string;
    fileType: string;
    reasoning: string[];
    sources: { title: string; url: string; snippet: string }[];
    timestamp: Date;
}

export default function App() {
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showBanner, setShowBanner] = useState(true);

    const handleFileUpload = (file: File) => {
        setIsAnalyzing(true);
        setTimeout(() => {
            const mockResult: AnalysisResult = {
                trustScore: 8.5,
                file: file,
                fileName: file.name,
                fileType: file.type || "application/pdf",
                reasoning: [
                    "Metadata analysis shows consistent timestamp patterns.",
                    "No detection of common AI generation artifacts.",
                    "Content exhibits natural variation consistent with authentic media.",
                    "Minor compression artifacts detected, likely from social media.",
                ],
                sources: [
                    {
                        title: "AI Detection Research 2024",
                        url: "#",
                        snippet:
                            "Authentic content typically exhibits specific metadata...",
                    },
                    {
                        title: "Digital Forensics DB",
                        url: "#",
                        snippet: "Cross-referenced with known AI signatures...",
                    },
                ],
                timestamp: new Date(),
            };
            setResult(mockResult);
            setIsAnalyzing(false);
        }, 2500);
    };

    const handleReset = () => {
        setResult(null);
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 font-sans">
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
            </div>

            <header className="relative z-20 border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={handleReset}
                    >
                        <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                            <Shield className="size-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                                Verif<span className="text-indigo-600">ai</span>
                            </h1>
                        </div>
                    </div>
                    <div className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
                        Beta v2.0
                    </div>
                </div>
            </header>

            {showBanner && (
                <div className="relative z-10 bg-indigo-50/50 border-b border-indigo-100">
                    <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-white rounded-md shadow-sm border border-indigo-100">
                                <Chrome className="size-4 text-indigo-500" />
                            </div>
                            <p className="text-sm font-medium text-slate-700">
                                Verify content while you browse with the{" "}
                                <span className="text-indigo-600 font-semibold">
                                    Verifai Chrome Extension
                                </span>
                                .
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                                Install Free <ArrowRight className="size-3" />
                            </button>
                            <button
                                onClick={() => setShowBanner(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
                {!result ? (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="text-center space-y-6 max-w-2xl mx-auto mt-8">
                            <h2 className="text-5xl font-bold tracking-tight text-slate-900">
                                Is it{" "}
                                <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                                    Real
                                </span>{" "}
                                or{" "}
                                <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                                    AI?
                                </span>
                            </h2>
                            <p className="text-lg text-slate-500 leading-relaxed">
                                Advanced forensic analysis for images, audio,
                                and documents. Upload a file to uncover the
                                invisible fingerprints of artificial
                                intelligence.
                            </p>
                        </div>

                        <UploadZone
                            onFileUpload={handleFileUpload}
                            isAnalyzing={isAnalyzing}
                        />

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: Zap,
                                    title: "Instant Analysis",
                                    desc: "Real-time processing across 15 detection vectors.",
                                    color: "text-amber-600",
                                    bg: "bg-amber-50",
                                },
                                {
                                    icon: Search,
                                    title: "Deep Forensics",
                                    desc: "Metadata extraction and compression artifact study.",
                                    color: "text-cyan-600",
                                    bg: "bg-cyan-50",
                                },
                                {
                                    icon: Lock,
                                    title: "Privacy First",
                                    desc: "Files are analyzed in memory and never stored.",
                                    color: "text-emerald-600",
                                    bg: "bg-emerald-50",
                                },
                            ].map((feature, i) => (
                                <div
                                    key={i}
                                    className="group p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300"
                                >
                                    <div
                                        className={`w-10 h-10 ${feature.bg} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                                    >
                                        <feature.icon
                                            className={`size-5 ${feature.color}`}
                                        />
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <ResultsDisplay result={result} onReset={handleReset} />
                )}
            </main>
        </div>
    );
}

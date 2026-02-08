import React from "react";

import type { AnalysisResult } from "../types";

interface AnalysisProps {
    loading: boolean;
    result: AnalysisResult | null;
    onReset: () => void;
}

export const Analysis: React.FC<AnalysisProps> = ({
    loading,
    result,
    onReset,
}) => {
    const score = result?.score ?? 0;
    const isSafe = score > 70;

    return (
        <div className="w-[400px] h-[600px] bg-[#141419]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                <span className="text-white font-semibold text-sm">
                    AI Analysis
                </span>
                <button
                    onClick={onReset}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                    Close
                </button>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center h-full text-indigo-500">
                    <div className="animate-spin mb-3 w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                    <span className="text-xs tracking-wider uppercase font-medium">
                        Processing...
                    </span>
                </div>
            )}

            {!loading && result && (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div
                        className={`
                            border rounded-xl p-4 text-center mb-4 transition-all
                            ${isSafe ? "bg-green-400/10 border-green-400/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-500"}
                        `}
                    >
                        <div className="font-black text-3xl">{score}%</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-70">
                            {isSafe ? "Likely Human" : "AI Detected"}
                        </div>
                    </div>

                    <div className="text-[13px] text-gray-300 leading-relaxed flex-grow overflow-y-auto pr-2 custom-scrollbar">
                        <div className="mb-6">
                            <strong className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 block font-bold">
                                Reasoning
                            </strong>
                            <p className="bg-white/5 p-3 rounded-lg border border-white/5">
                                {result.reasoning ||
                                    "No detailed reasoning provided by the server."}
                            </p>
                        </div>

                        <div className="mt-2">
                            <strong className="text-[10px] uppercase tracking-wide text-gray-500 mb-2 block font-bold">
                                Sources & Links
                            </strong>
                            <div className="flex flex-col gap-2">
                                {Array.isArray(result.sources) &&
                                result.sources.length > 0 ? (
                                    result.sources.map((src, idx) => (
                                        <a
                                            key={idx}
                                            href={src}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-indigo-400 hover:text-indigo-300 truncate block text-xs bg-indigo-500/5 p-2 rounded border border-indigo-500/10 transition-colors"
                                        >
                                            {src}
                                        </a>
                                    ))
                                ) : (
                                    <span className="text-gray-600 italic text-xs">
                                        No sources available
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button className="mt-4 bg-white/5 border border-white/10 text-gray-300 py-3 rounded-xl text-xs font-bold hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]">
                        View Full Report
                    </button>
                </div>
            )}
        </div>
    );
};

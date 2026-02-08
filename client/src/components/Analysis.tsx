import React from "react";
import type { AnalysisResult } from "../types";

interface AnalysisProps {
    loading: boolean;
    result: AnalysisResult | null;
    onReset: () => void;
}

export const Analysis: React.FC<AnalysisProps> = ({ loading, result, onReset }) => {
    const isSafe = (result?.score || 0) > 70;

    return (
        <div className="w-[600px] h-[400px] bg-[#141419]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col">
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
                    <span className="text-xs tracking-wider uppercase">
                        Processing...
                    </span>
                </div>
            )}

            {!loading && result && (
                <div className="flex flex-col h-full animate-in fade-in duration-500">
                    <div
                        className={`
                        border rounded-lg p-4 text-center font-extrabold text-2xl mb-4 transition-all
                        ${isSafe ? "bg-green-400/10 border-green-400/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-500"}
                    `}
                    >
                        {result.score}% TRUST
                    </div>

                    <div className="text-[13px] text-gray-300 leading-relaxed flex-grow overflow-y-auto pr-2">
                        <p className="mb-4">{result.reasoning}</p>

                        {result.sources.length > 0 && (
                            <div className="mt-2">
                                <strong className="text-xs uppercase tracking-wide text-gray-500 mb-2 block">
                                    Sources
                                </strong>
                                <div className="flex flex-col gap-1">
                                    {result.sources.map((src, idx) => (
                                        <a
                                            key={idx}
                                            href={src}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-indigo-400 hover:text-indigo-300 truncate block text-xs"
                                        >
                                            {src}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="mt-4 bg-white/10 border border-white/10 text-gray-200 py-2 rounded-lg text-xs font-bold hover:bg-white/20 transition-all">
                        View Full Details
                    </button>
                </div>
            )}
        </div>
    );
};

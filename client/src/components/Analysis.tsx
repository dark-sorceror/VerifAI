import React, { useEffect, useState } from "react";

import { type AnalysisResult } from "../types";

interface AnalysisProps {
    loading: boolean;
    result: AnalysisResult | null;
    onReset: () => void;
}

const getTierStyles = (score: number) => {
    if (score >= 81)
        return {
            color: "text-green-400",
            bg: "bg-green-400/10",
            border: "border-green-400/30",
            defaultLabel: "Truth",
        };
    if (score >= 61)
        return {
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/30",
            defaultLabel: "Likely True",
        };
    if (score >= 41)
        return {
            color: "text-yellow-400",
            bg: "bg-yellow-400/10",
            border: "border-yellow-400/30",
            defaultLabel: "Unverified",
        };
    if (score >= 21)
        return {
            color: "text-orange-400",
            bg: "bg-orange-400/10",
            border: "border-orange-400/30",
            defaultLabel: "Misleading",
        };
    return {
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        defaultLabel: "High Risk",
    };
};

const getVerdictDescription = (score: number) => {
    if (score >= 81)
        return "Looks like this is legitimate! The main claims check out based on verified sources.";
    if (score >= 61)
        return "There's definitely truth to this, but it might be missing some important context or nuance.";
    if (score >= 41)
        return "This is a bit of a mixed bag. Some parts are accurate, but others are completely unverified.";
    if (score >= 21)
        return "Take this with a massive grain of salt. It's highly misleading or twisting the actual facts.";

    return "Watch out—this looks completely fabricated or is known disinformation. Don't fall for it!";
};

const formatUrlDisplay = (urlStr: string) => {
    try {
        const url = new URL(urlStr);

        if (url.hostname.includes("vertexaisearch"))
            return "Google Search Reference";

        return url.hostname.replace("www.", "");
    } catch (e) {
        return "Source Link";
    }
};

const CopyButton = ({ url }: { url: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1.5 ml-auto text-gray-500 hover:text-white transition-colors bg-white/5 rounded hover:bg-white/10"
            title="Copy Link"
        >
            {copied ? (
                <svg
                    className="w-3.5 h-3.5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                    ></path>
                </svg>
            ) : (
                <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    ></path>
                </svg>
            )}
        </button>
    );
};

export const Analysis: React.FC<AnalysisProps> = ({
    loading,
    result,
    onReset,
}) => {
    useEffect(() => {
        if (result) console.log("🔥 RAW DATA RECEIVED:", result);
    }, [result]);

    const score = result?.score ?? 0;
    const tier = getTierStyles(score);
    const label =
        result?.label && result.label !== "UNKNOWN"
            ? result.label
            : tier.defaultLabel;
    const verdictBrief = getVerdictDescription(score);

    const handleExternalLink = (e: React.MouseEvent, url: string) => {
        e.preventDefault();

        try {
            const electron = (window as any).require("electron");
            electron.shell.openExternal(url);
        } catch (err) {
            window.open(url, "_blank");
        }
    };

    let reasoningPoints: {
        title: string;
        bullets?: string[];
        detail?: string;
    }[] = [];
    if (result?.reasoning_points) {
        if (
            Array.isArray(result.reasoning_points) &&
            result.reasoning_points.length > 0
        ) {
            reasoningPoints = result.reasoning_points;
        } else if (typeof result.reasoning_points === "string") {
            reasoningPoints = [
                { title: "Analysis", detail: result.reasoning_points },
            ];
        } else if (typeof result.reasoning_points === "object") {
            reasoningPoints = Object.entries(result.reasoning_points).map(
                ([k, v]) => ({
                    title: k,
                    detail: String(v),
                }),
            );
        }
    }
    if (reasoningPoints.length === 0) {
        reasoningPoints = [
            {
                title: "Analysis Summary",
                detail: "Content scanned via Google Search but the detailed breakdown could not be parsed.",
            },
        ];
    }

    const sources = Array.isArray(result?.sources) ? result.sources : [];

    return (
        <div className="w-[400px] h-[600px] bg-[#141419]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col overflow-hidden relative">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.6); }
            `}</style>

            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3 flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                    AI Analysis
                </span>
                <button
                    onClick={onReset}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                    <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        ></path>
                    </svg>
                </button>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center h-full text-indigo-500">
                    <div className="animate-spin mb-3 w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                    <span className="text-xs tracking-wider uppercase font-medium">
                        Searching & Verifying...
                    </span>
                </div>
            )}

            {!loading && result && (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden">
                    <div
                        className={`border rounded-xl p-4 text-center mb-4 transition-all flex-shrink-0 ${tier.bg} ${tier.border} ${tier.color}`}
                    >
                        <div className="font-black text-4xl mb-1">{score}%</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80">
                            {label}
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto pr-3 custom-scrollbar">
                        <div className="mb-5 bg-white/5 border border-white/10 rounded-lg p-3">
                            <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-bold">
                                Verdict Summary
                            </h4>
                            <p className="text-gray-300 text-xs leading-relaxed font-medium">
                                {verdictBrief}
                            </p>
                        </div>

                        <div className="mb-6">
                            <strong className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 block font-bold">
                                Key Findings
                            </strong>
                            <div className="flex flex-col gap-3">
                                {reasoningPoints.map(
                                    (point: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="bg-white/5 p-3 rounded-lg border border-white/5"
                                        >
                                            <span className="block font-bold text-indigo-300 mb-1.5 text-[11px] uppercase tracking-wide">
                                                {point.title || "Key Detail"}
                                            </span>
                                            {point.detail && (
                                                <div className="text-gray-200 text-xs leading-relaxed font-medium mb-2 border-l-2 border-indigo-400/50 pl-2">
                                                    {point.detail}
                                                </div>
                                            )}
                                            {Array.isArray(point.bullets) &&
                                                point.bullets.length > 0 && (
                                                    <ul className="list-disc pl-5 space-y-1.5 text-gray-400 text-xs marker:text-indigo-500">
                                                        {point.bullets.map(
                                                            (
                                                                bullet: string,
                                                                bIdx: number,
                                                            ) => (
                                                                <li
                                                                    key={bIdx}
                                                                    className="leading-relaxed"
                                                                >
                                                                    {bullet}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                )}
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>

                        <div className="mt-2 pb-4">
                            <strong className="text-[10px] uppercase tracking-wide text-gray-500 mb-2 block font-bold">
                                Verified Sources
                            </strong>
                            <div className="flex flex-col gap-2">
                                {sources.length > 0 ? (
                                    sources.map((rawSrc, idx) => {
                                        let url = "";
                                        let siteName = "";

                                        if (typeof rawSrc === "string") {
                                            url = rawSrc;
                                            siteName = formatUrlDisplay(url);
                                        } else if (
                                            rawSrc &&
                                            typeof rawSrc === "object"
                                        ) {
                                            url =
                                                (rawSrc as any).url ||
                                                (rawSrc as any).link ||
                                                "";

                                            siteName =
                                                (rawSrc as any).site_name ||
                                                (rawSrc as any).domain ||
                                                formatUrlDisplay(url);
                                        }

                                        if (!url || url.length < 5) return null;

                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 bg-indigo-500/5 p-1.5 pl-2 rounded border border-indigo-500/10 transition-colors hover:bg-indigo-500/10"
                                            >
                                                <a
                                                    href={url}
                                                    onClick={(e) =>
                                                        handleExternalLink(
                                                            e,
                                                            url,
                                                        )
                                                    }
                                                    className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 truncate text-xs flex-grow cursor-pointer"
                                                    title={url}
                                                >
                                                    <svg
                                                        className="w-3 h-3 flex-shrink-0"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
                                                    </svg>
                                                    <span className="truncate font-semibold">
                                                        {siteName}
                                                    </span>
                                                </a>
                                                <CopyButton url={url} />
                                            </div>
                                        );
                                    })
                                ) : (
                                    <span className="text-gray-600 italic text-xs bg-white/5 p-2 rounded block">
                                        No direct external links provided by AI.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

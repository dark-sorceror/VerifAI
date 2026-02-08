import { useEffect, useState } from "react";
import { TrustScore } from "./Score";
import {
    ArrowLeft,
    FileText,
    Image as ImageIcon,
    CheckCircle2,
    ExternalLink,
    Download,
    MoreVertical,
    Maximize2,
} from "lucide-react";

export interface AnalysisResult {
    trustScore: number;
    file: File;
    fileName: string;
    fileType: string;
    reasoning: string[];
    sources: { title: string; url: string; snippet: string }[];
    timestamp: Date;
}

interface ResultsDisplayProps {
    result: AnalysisResult;
    onReset: () => void;
}

export function ResultsDisplay({ result, onReset }: ResultsDisplayProps) {
    const [fileUrl, setFileUrl] = useState<string>("");
    const isTrusted = result.trustScore >= 7;
    const isSuspicious = result.trustScore < 4;

    const isDoc =
        result.fileType.includes("pdf") || result.fileType.includes("document");
    const FileIcon = isDoc ? FileText : ImageIcon;

    useEffect(() => {
        if (result.file) {
            const url = URL.createObjectURL(result.file);

            setFileUrl(url);

            return () => URL.revokeObjectURL(url);
        }
    }, [result.file]);

    return (
        <div className="w-full animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-6 flex items-center justify-between">
                <button
                    onClick={onReset}
                    className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium pl-1"
                >
                    <div className="p-1.5 rounded-full bg-white border border-slate-200 group-hover:border-indigo-500 group-hover:text-indigo-600 transition-colors shadow-sm">
                        <ArrowLeft className="size-4" />
                    </div>
                    <span>Analyze New File</span>
                </button>

                <span className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    Analyzed: {result.timestamp.toLocaleTimeString()}
                </span>
            </div>

            <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[800px]">
                <div className="lg:col-span-6 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col h-full relative">
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                        <div className="flex items-center gap-2">
                            <FileIcon className="size-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">
                                {result.fileName}
                            </span>
                        </div>
                        <button className="p-1.5 hover:bg-slate-200 rounded text-slate-400 transition-colors">
                            <Maximize2 className="size-4" />
                        </button>
                    </div>

                    <div className="flex-1 w-full h-full bg-slate-100 relative overflow-hidden">
                        {fileUrl ? (
                            isDoc ? (
                                <iframe
                                    src={fileUrl}
                                    className="w-full h-full border-none"
                                    title="PDF Viewer"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
                                    <img
                                        src={fileUrl}
                                        alt="Analysis Target"
                                        className="max-w-full max-h-full object-contain rounded shadow-sm border border-slate-200 bg-white"
                                    />
                                </div>
                            )
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                                Loading Preview...
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-6 flex flex-col h-full bg-white">
                    <div className="flex-1 overflow-y-auto p-8 lg:p-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        <div className="flex flex-col-reverse sm:flex-row sm:items-start justify-between gap-6 mb-8 pb-8 border-b border-slate-100">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                                            isTrusted
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                : isSuspicious
                                                  ? "bg-rose-50 text-rose-600 border-rose-100"
                                                  : "bg-amber-50 text-amber-600 border-amber-100"
                                        }`}
                                    >
                                        {isTrusted
                                            ? "Verified Authentic"
                                            : isSuspicious
                                              ? "Suspected AI"
                                              : "Uncertain"}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Analysis Report
                                </h2>
                                <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                                    Deep forensic scan completed across 15
                                    detection vectors including compression
                                    artifacts and metadata consistency.
                                </p>
                            </div>

                            <div className="flex-shrink-0">
                                <TrustScore score={result.trustScore} />
                            </div>
                        </div>

                        <div className="space-y-8 pb-10">
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle2 className="size-4" />
                                    Key Findings
                                </h3>
                                <div className="grid gap-3">
                                    {result.reasoning.map((reason, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-3 group p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                                        >
                                            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600 mt-0.5 border border-indigo-100">
                                                {index + 1}
                                            </span>
                                            <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                                                {reason}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <ExternalLink className="size-4" />
                                    Matches & References
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {result.sources.map((source, i) => (
                                        <a
                                            key={i}
                                            href={source.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/50 transition-all bg-white group"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 truncate">
                                                    {source.title}
                                                </h4>
                                                <ExternalLink className="size-3 text-slate-300 group-hover:text-indigo-400" />
                                            </div>
                                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                                {source.snippet}
                                            </p>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
                        <button className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
                            <MoreVertical className="size-3" />
                            Report Issue
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all shadow-sm">
                            <Download className="size-3.5" />
                            Download Full Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

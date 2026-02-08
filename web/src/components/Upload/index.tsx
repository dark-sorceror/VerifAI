import { useState, useRef } from "react";
import {
    Upload,
    Image,
    FileText,
    Music,
    Video,
    Loader2,
    ArrowRight,
} from "lucide-react";

import "./index.css";

interface UploadZoneProps {
    onFileUpload: (file: File) => void;
    isAnalyzing: boolean;
}

export function UploadZone({ onFileUpload, isAnalyzing }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;

        if (files.length > 0) onFileUpload(files[0]);
    };

    return (
        <>
            <div className="max-w-2xl mx-auto w-full">
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() =>
                        !isAnalyzing && fileInputRef.current?.click()
                    }
                    className={`
            relative group overflow-hidden rounded-[20px] p-12 text-center cursor-pointer
            transition-all duration-300
            gradient-box
            ${isDragging ? "scale-[1.01]" : "hover:scale-[1.01]"}
            ${isAnalyzing ? "pointer-events-none opacity-80" : ""}
          `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                            e.target.files?.[0] &&
                            onFileUpload(e.target.files[0])
                        }
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                    />

                    {isAnalyzing ? (
                        <div className="py-8 flex flex-col items-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
                                <Loader2 className="size-16 text-indigo-600 animate-spin relative z-10" />
                            </div>
                            <p className="mt-6 text-lg font-bold text-slate-800">
                                Scanning Deep Patterns...
                            </p>
                            <p className="text-sm text-slate-500 mt-2">
                                Analyzing metadata and artifacting
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="w-20 h-20 mx-auto bg-white/60 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white shadow-sm backdrop-blur-sm">
                                <Upload className="size-8 text-indigo-500" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                                Upload Investigation File
                            </h3>
                            <p className="text-slate-600 text-sm mb-8 max-w-sm mx-auto font-medium">
                                Drag & drop or click to browse. Supports
                                high-res media and documents.
                            </p>

                            <div className="flex items-center justify-center gap-8 pt-6 border-t border-slate-200/50">
                                {[
                                    { Icon: Image, label: "IMG" },
                                    { Icon: Video, label: "VID" },
                                    { Icon: Music, label: "AUD" },
                                    { Icon: FileText, label: "DOC" },
                                ].map(({ Icon, label }) => (
                                    <div
                                        key={label}
                                        className="flex flex-col items-center gap-2 group/icon"
                                    >
                                        <Icon className="size-5 text-slate-400 group-hover/icon:text-indigo-600 transition-colors" />
                                        <span className="text-[10px] font-bold text-slate-500 group-hover/icon:text-slate-700 transition-colors tracking-wider">
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="absolute bottom-5 right-5 bg-slate-900 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg">
                                <ArrowRight className="w-4 h-4 text-white" />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

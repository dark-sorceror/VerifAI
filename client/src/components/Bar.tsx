import React from "react";

interface BarProps {
    status: string;
    onSnip: () => void;
    onUpload: () => void;
    onClose: () => void;
    dragHandleRef: React.RefObject<HTMLDivElement>;
}

export const Bar: React.FC<BarProps> = ({
    status,
    onSnip,
    onUpload,
    onClose,
    dragHandleRef,
}) => {
    return (
        <div
            ref={dragHandleRef}
            className="god-bar-gradient w-full h-[70px] rounded-2xl border-[3px] border-transparent flex items-center justify-between px-6 cursor-grab active:cursor-grabbing shadow-2xl z-50"
        >
            <div className="flex items-center gap-3 pointer-events-none">
                <span className="text-white font-bold tracking-widest text-lg">
                    VerifAI
                </span>
                <span className="text-xs text-gray-400 uppercase tracking-wide">
                    {status}
                </span>
            </div>

            <div
                className="flex items-center gap-3"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onSnip}
                    className="action-btn bg-white/10 border border-white/10 text-gray-200 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-white/20 hover:-translate-y-[1px] transition-all"
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
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        ></path>
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                    </svg>
                    Snip Screen
                </button>

                <button
                    onClick={onUpload}
                    className="action-btn bg-white/10 border border-white/10 text-gray-200 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-white/20 hover:-translate-y-[1px] transition-all"
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
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        ></path>
                    </svg>
                    Upload File
                </button>

                <div
                    onClick={onClose}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-gray-500 cursor-pointer hover:bg-red-500 hover:text-white transition-colors ml-2"
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
                </div>
            </div>
        </div>
    );
};

import React from "react";

import type { SnipCoordinates } from "../types";

interface ScreenshotProps {
    imageSrc: string | null;
    crop: SnipCoordinates | null;
}

export const Screenshot: React.FC<ScreenshotProps> = ({ imageSrc, crop }) => {
    if (!imageSrc) return null;

    return (
        <div className="relative group">
            <div
                className="
                rounded-2xl 
                overflow-hidden 
                border-2 border-white/20 
                shadow-2xl 
                bg-black/50
                transition-transform hover:scale-[1.02] duration-300
            "
            >
                <img
                    src={imageSrc}
                    alt="Snipped Content"
                    className="max-w-[300px] max-h-[300px] object-contain"
                />
            </div>

            {crop && (
                <div className="absolute -bottom-8 left-0 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {Math.round(crop.width)}x{Math.round(crop.height)}
                </div>
            )}
        </div>
    );
};

import React, { useEffect, useRef } from "react";
import type { SnipCoordinates } from "../types";

interface ScreenshotProps {
    imageSrc: string | null;
    crop: SnipCoordinates | null;
}

export const Screenshot: React.FC<ScreenshotProps> = ({
    imageSrc,
    crop,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!imageSrc || !crop || !canvasRef.current) return;

        const ctx = canvasRef.current.getContext("2d");

        if (!ctx) return;

        const img = new Image();

        img.onload = () => {
            canvasRef.current!.width = crop.width;
            canvasRef.current!.height = crop.height;

            ctx.drawImage(
                img,
                crop.x,
                crop.y,
                crop.width,
                crop.height,
                0,
                0,
                crop.width,
                crop.height,
            );
        };
        img.src = imageSrc;
    }, [imageSrc, crop]);

    return (
        <div className="bg-[#1e1e23]/85 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl flex flex-col max-h-[500px]">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">
                Context
            </div>
            <div className="rounded-[10px] overflow-hidden border border-white/10">
                <canvas
                    ref={canvasRef}
                    className="block max-h-[450px] w-auto h-auto max-w-full"
                />
            </div>
        </div>
    );
};

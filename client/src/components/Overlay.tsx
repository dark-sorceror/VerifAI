import React, { useEffect, useRef } from "react";

export const Overlay: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const { ipcRenderer } = (window as any).require("electron");
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let isDrawing = false;
        let startX = 0;
        let startY = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };
        window.addEventListener("resize", resize);
        resize();

        const handleReset = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            canvas.style.cursor = "crosshair";
        };

        ipcRenderer.on("reset-snip", handleReset);

        const onMouseDown = (e: MouseEvent) => {
            isDrawing = true;
            startX = e.clientX;
            startY = e.clientY;
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDrawing) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const width = e.clientX - startX;
            const height = e.clientY - startY;

            ctx.clearRect(startX, startY, width, height);

            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2;
            ctx.strokeRect(startX, startY, width, height);
        };

        const onMouseUp = (e: MouseEvent) => {
            isDrawing = false;
            canvas.style.cursor = "default";

            const rawWidth = e.clientX - startX;
            const rawHeight = e.clientY - startY;

            if (Math.abs(rawWidth) > 10 && Math.abs(rawHeight) > 10) {
                const x = rawWidth < 0 ? e.clientX : startX;
                const y = rawHeight < 0 ? e.clientY : startY;
                const width = Math.abs(rawWidth);
                const height = Math.abs(rawHeight);

                ipcRenderer.send("snip-complete", {
                    x: Math.round(x),
                    y: Math.round(y),
                    width: Math.round(width),
                    height: Math.round(height),
                });
            }
        };

        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mouseup", onMouseUp);

        return () => {
            window.removeEventListener("resize", resize);
            ipcRenderer.removeListener("reset-snip", handleReset);
            canvas.removeEventListener("mousedown", onMouseDown);
            canvas.removeEventListener("mousemove", onMouseMove);
            canvas.removeEventListener("mouseup", onMouseUp);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="block w-screen h-screen cursor-crosshair"
        />
    );
};

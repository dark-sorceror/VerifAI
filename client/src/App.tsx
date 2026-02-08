import { useEffect, useRef, useState } from "react";

import { useDraggable } from "./hooks/useDraggable";

import { Bar } from "./components/Bar";
import { Screenshot } from "./components/Screenshot";
import { Analysis } from "./components/Analysis";
import { Overlay } from "./components/Overlay";

import type { AnalysisResult, SnipCoordinates } from "./types";

function MainUI() {
    let ipcRenderer: any = null;

    try {
        const electron = (window as any).require("electron");

        ipcRenderer = electron.ipcRenderer;
    } catch (e) {
        console.error("Electron not found");
    }

    if (!ipcRenderer) {
        return (
            <div className="p-10 text-red-500 font-bold select-text">
                Error: Electron Backend Not Connected
            </div>
        );
    }

    const [status, setStatus] = useState("READY");
    const [isIslandsVisible, setIsIslandsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<SnipCoordinates | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const dragHandleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleSnipStart = (
            _: any,
            data: { image: string; crop: SnipCoordinates },
        ) => {
            setStatus("UPLOADING...");
            setImageSrc(data.image);
            setCrop(data.crop);
            setIsIslandsVisible(true);
            setIsLoading(true);
        };

        const handleSnipSuccess = (_: any, apiResult: AnalysisResult) => {
            setStatus("COMPLETE");
            setIsLoading(false);
            setResult(apiResult);
        };

        ipcRenderer.on("snip-start", handleSnipStart);
        ipcRenderer.on("snip-success", handleSnipSuccess);

        return () => {
            ipcRenderer.removeListener("snip-start", handleSnipStart);
            ipcRenderer.removeListener("snip-success", handleSnipSuccess);
        };
    }, []);

    const startX = (window.innerWidth - 850) / 2;
    const { elementRef, startDrag } = useDraggable(startX, 50);

    const handleMouseEnter = () =>
        ipcRenderer.send("set-ignore-mouse-events", false);
    const handleMouseLeave = () =>
        ipcRenderer.send("set-ignore-mouse-events", true, { forward: true });
    const triggerSnip = () => ipcRenderer.send("start-snip-manual");
    const triggerUpload = () => console.log("Upload triggered");
    const closeApp = () => window.close();

    const resetUI = () => {
        setIsIslandsVisible(false);
        setTimeout(() => {
            setResult(null);
            setImageSrc(null);
            setStatus("READY");
        }, 300);
    };

    return (
        <div
            id="movable-container"
            ref={elementRef}
            className="absolute flex flex-col items-center w-[850px]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div onMouseDown={startDrag} className="w-full">
                <Bar
                    status={status}
                    onSnip={triggerSnip}
                    onUpload={triggerUpload}
                    onClose={closeApp}
                    dragHandleRef={dragHandleRef}
                />
            </div>

            <div
                className={`
                    w-[1200px] flex justify-center items-start gap-5 pt-5 transition-opacity duration-300
                    ${
                        isIslandsVisible ||
                        isLoading ||
                        status === "UPLOADING..."
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none"
                    }
                `}
            >
                <Screenshot imageSrc={imageSrc} crop={crop} />
                <Analysis
                    loading={isLoading}
                    result={result}
                    onReset={resetUI}
                />
            </div>
        </div>
    );
}

export default function App() {
    const [route, setRoute] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => setRoute(window.location.hash);

        window.addEventListener("hashchange", handleHashChange);

        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    if (route === "#/overlay") {
        return <Overlay />;
    }

    return <MainUI />;
}

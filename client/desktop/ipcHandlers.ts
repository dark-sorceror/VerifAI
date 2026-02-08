import {
    ipcMain,
    BrowserWindow,
    desktopCapturer,
    IpcMainEvent,
} from "electron";
import { getMainWindow, getOverlayWindow } from "./windowManager";
import { analyzeImageWithBackend } from "./services/api";
import { SnipCoordinates, SnipPayload } from "../src/types";

export function registerIpcHandlers(): void {
    ipcMain.on(
        "set-ignore-mouse-events",
        (
            event: IpcMainEvent,
            ignore: boolean,
            options?: { forward: boolean },
        ) => {
            const win = BrowserWindow.fromWebContents(event.sender);

            if (win) {
                win.setIgnoreMouseEvents(ignore, options);
            }
        },
    );

    ipcMain.on("start-snip-manual", () => {
        const overlay = getOverlayWindow();

        if (overlay) {
            overlay.show();
            overlay.webContents.send("reset-snip");
            overlay.focus();
        }
    });

    ipcMain.on(
        "snip-complete",
        async (event: IpcMainEvent, coordinates: SnipCoordinates) => {
            const overlay = getOverlayWindow();
            const main = getMainWindow();

            if (overlay) overlay.hide();
            if (main) main.show();

            try {
                const sources = await desktopCapturer.getSources({
                    types: ["screen"],
                    thumbnailSize: { width: 1920, height: 1080 },
                });

                if (sources.length === 0) {
                    console.error("No screen sources found");

                    return;
                }

                const imageBase64 = sources[0].thumbnail.toDataURL();

                if (main) {
                    const payload: SnipPayload = {
                        image: imageBase64,
                        crop: coordinates,
                    };

                    main.webContents.send("snip-start", payload);
                }

                const apiResult = await analyzeImageWithBackend(imageBase64);

                if (main) {
                    main.webContents.send("snip-success", apiResult);
                }
            } catch (err) {
                console.error("Snip failed:", err);
            }
        },
    );
}

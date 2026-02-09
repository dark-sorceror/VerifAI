import { ipcMain, desktopCapturer, screen } from "electron";
import { getMainWindow, getOverlayWindow } from "./windowManager";
import { analyzeImageWithBackend } from "./services/api";

export function registerIpcHandlers() {
    ipcMain.on("snip-complete", async (event, cropData) => {
        const overlayWindow = getOverlayWindow();
        const mainWindow = getMainWindow();

        if (overlayWindow) {
            overlayWindow.hide();
            overlayWindow.webContents.send("reset-snip");
        }

        try {
            let { x, y, width, height } = cropData;
            if (width < 10) width = 10;
            if (height < 10) height = 10;

            const display = screen.getPrimaryDisplay();
            const { width: screenWidth, height: screenHeight } = display.size;

            const sources = await desktopCapturer.getSources({
                types: ["screen"],
                thumbnailSize: {
                    width: screenWidth * display.scaleFactor,
                    height: screenHeight * display.scaleFactor,
                },
            });

            const primarySource = sources[0];
            const fullImage = primarySource.thumbnail;
            const imgSize = fullImage.getSize();

            const scaleX = imgSize.width / screenWidth;
            const scaleY = imgSize.height / screenHeight;

            const cropRect = {
                x: Math.round(x * scaleX),
                y: Math.round(y * scaleY),
                width: Math.round(width * scaleX),
                height: Math.round(height * scaleY),
            };

            const croppedImage = fullImage.crop(cropRect);
            const base64Image = croppedImage.toDataURL();

            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore();

                mainWindow.show();
                mainWindow.setAlwaysOnTop(true);
                mainWindow.focus();

                setTimeout(async () => {
                    mainWindow.webContents.send("snip-start", {
                        image: base64Image,
                        crop: { x, y, width, height },
                    });

                    const analysisResult =
                        await analyzeImageWithBackend(base64Image);

                    mainWindow.webContents.send("snip-success", analysisResult);
                }, 200);
            }
        } catch (error) {
            console.error("Snip Processing Failed:", error);
        }
    });
    ipcMain.on("set-ignore-mouse-events", (event, ignore, options) => {
        const win = BrowserWindow.fromWebContents(event.sender);

        win?.setIgnoreMouseEvents(ignore, options);
    });

    ipcMain.on("start-snip-manual", () => {
        const overlay = getOverlayWindow();

        if (overlay) {
            overlay.show();
            overlay.focus();
            overlay.webContents.send("reset-snip");
        }
    });
}

import { BrowserWindow } from "electron";

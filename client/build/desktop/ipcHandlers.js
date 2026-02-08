"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIpcHandlers = registerIpcHandlers;
const electron_1 = require("electron");
const windowManager_1 = require("./windowManager");
const api_1 = require("./services/api");
function registerIpcHandlers() {
    electron_1.ipcMain.on("snip-complete", async (event, cropData) => {
        const overlayWindow = (0, windowManager_1.getOverlayWindow)();
        const mainWindow = (0, windowManager_1.getMainWindow)();
        if (overlayWindow) {
            overlayWindow.hide();
            overlayWindow.webContents.send("reset-snip");
        }
        try {
            let { x, y, width, height } = cropData;
            if (width < 10)
                width = 10;
            if (height < 10)
                height = 10;
            const display = electron_1.screen.getPrimaryDisplay();
            const { width: screenWidth, height: screenHeight } = display.size;
            const sources = await electron_1.desktopCapturer.getSources({
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
                if (mainWindow.isMinimized())
                    mainWindow.restore();
                mainWindow.show();
                mainWindow.setAlwaysOnTop(true);
                mainWindow.focus();
                setTimeout(async () => {
                    mainWindow.webContents.send("snip-start", {
                        image: base64Image,
                        crop: { x, y, width, height },
                    });
                    const analysisResult = await (0, api_1.analyzeImageWithBackend)(base64Image);
                    mainWindow.webContents.send("snip-success", analysisResult);
                }, 200);
            }
        }
        catch (error) {
            console.error("Snip Processing Failed:", error);
        }
    });
    electron_1.ipcMain.on("set-ignore-mouse-events", (event, ignore, options) => {
        const win = electron_2.BrowserWindow.fromWebContents(event.sender);
        win?.setIgnoreMouseEvents(ignore, options);
    });
    electron_1.ipcMain.on("start-snip-manual", () => {
        const overlay = (0, windowManager_1.getOverlayWindow)();
        if (overlay) {
            overlay.show();
            overlay.focus();
            overlay.webContents.send("reset-snip");
        }
    });
}
const electron_2 = require("electron");

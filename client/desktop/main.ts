import { app } from "electron";
import { createMainWindow, createOverlayWindow } from "./windowManager";
import { registerIpcHandlers } from "./ipcHandlers";
import { registerShortcuts } from "./shortcuts";

app.whenReady().then(() => {
    createMainWindow();
    createOverlayWindow();

    registerIpcHandlers();
    registerShortcuts();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const windowManager_1 = require("./windowManager");
const ipcHandlers_1 = require("./ipcHandlers");
const shortcuts_1 = require("./shortcuts");
electron_1.app.whenReady().then(() => {
    (0, windowManager_1.createMainWindow)();
    (0, windowManager_1.createOverlayWindow)();
    (0, ipcHandlers_1.registerIpcHandlers)();
    (0, shortcuts_1.registerShortcuts)();
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerShortcuts = registerShortcuts;
const electron_1 = require("electron");
const windowManager_1 = require("./windowManager");
function registerShortcuts() {
    electron_1.globalShortcut.register("Alt+V", () => {
        const overlay = (0, windowManager_1.getOverlayWindow)();
        if (overlay) {
            overlay.show();
            overlay.webContents.send("reset-snip");
            overlay.focus();
        }
    });
    electron_1.globalShortcut.register("Alt+Space", () => {
        const main = (0, windowManager_1.getMainWindow)();
        if (main) {
            if (main.isVisible()) {
                main.hide();
            }
            else {
                main.show();
            }
        }
    });
}

import { globalShortcut } from "electron";
import { getMainWindow, getOverlayWindow } from "./windowManager";

export function registerShortcuts(): void {
    globalShortcut.register("Alt+V", () => {
        const overlay = getOverlayWindow();

        if (overlay) {
            overlay.show();
            overlay.webContents.send("reset-snip");
            overlay.focus();
        }
    });

    globalShortcut.register("Alt+Space", () => {
        const main = getMainWindow();

        if (main) {
            if (main.isVisible()) {
                main.hide();
            } else {
                main.show();
            }
        }
    });
}

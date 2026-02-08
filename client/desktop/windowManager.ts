import { app, BrowserWindow, screen } from "electron";

const DEV_URL = "http://localhost:5173";

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;

export function createMainWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width,
        height,
        x: 0,
        y: 0,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        hasShadow: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            sandbox: false,
            webSecurity: false,
        },
    });

    if (process.env.NODE_ENV === "development") {
        mainWindow.loadURL(DEV_URL);
    }

    mainWindow.setIgnoreMouseEvents(true, { forward: true });

    mainWindow.on("closed", () => {
        mainWindow = null;
        app.quit();
    });

    return mainWindow;
}

export function createOverlayWindow() {
    const { width, height } = screen.getPrimaryDisplay().bounds;

    overlayWindow = new BrowserWindow({
        width,
        height,
        x: 0,
        y: 0,
        show: false,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        hasShadow: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            sandbox: false,
            webSecurity: false,
        },
    });

    if (process.env.NODE_ENV === "development") {
        overlayWindow.loadURL(`${DEV_URL}/#/overlay`);
    }

    overlayWindow.on("closed", () => {
        overlayWindow = null;
    });

    return overlayWindow;
}

export function getMainWindow() {
    return mainWindow;
}
export function getOverlayWindow() {
    return overlayWindow;
}

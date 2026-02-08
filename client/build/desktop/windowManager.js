"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMainWindow = createMainWindow;
exports.createOverlayWindow = createOverlayWindow;
exports.getMainWindow = getMainWindow;
exports.getOverlayWindow = getOverlayWindow;
const electron_1 = require("electron");
const DEV_URL = "http://localhost:5173";
let mainWindow = null;
let overlayWindow = null;
function createMainWindow() {
    const { width, height } = electron_1.screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new electron_1.BrowserWindow({
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
        electron_1.app.quit();
    });
    return mainWindow;
}
function createOverlayWindow() {
    const { width, height } = electron_1.screen.getPrimaryDisplay().bounds;
    overlayWindow = new electron_1.BrowserWindow({
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
function getMainWindow() {
    return mainWindow;
}
function getOverlayWindow() {
    return overlayWindow;
}

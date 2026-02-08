"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
console.log("Preload running");
electron_1.contextBridge.exposeInMainWorld("electron", {
    ipcRenderer: {
        send: (channel, data) => electron_1.ipcRenderer.send(channel, data),
        on: (channel, func) => electron_1.ipcRenderer.on(channel, (event, ...args) => func(event, ...args)),
        removeListener: (channel, func) => electron_1.ipcRenderer.removeListener(channel, func),
    },
});

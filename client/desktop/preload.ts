import { contextBridge, ipcRenderer } from "electron";

console.log("Preload running");

contextBridge.exposeInMainWorld("electron", {
    ipcRenderer: {
        send: (channel: string, data: any) => ipcRenderer.send(channel, data),
        on: (channel: string, func: any) =>
            ipcRenderer.on(channel, (event, ...args) => func(event, ...args)),
        removeListener: (channel: string, func: any) =>
            ipcRenderer.removeListener(channel, func),
    },
});

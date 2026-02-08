export {};

declare global {
    interface Window {
        electron: {
            ipcRenderer: {
                send: (channel: string, data: any) => void;
                on: (channel: string, func: any) => void;
                removeListener: (channel: string, func: any) => void;
            };
        };
    }
}

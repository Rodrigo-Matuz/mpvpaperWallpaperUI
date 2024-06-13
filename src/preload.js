const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    selectFolder: () => ipcRenderer.invoke("select-folder"),
    playVideo: (videoPath) => ipcRenderer.invoke("play-video", videoPath),
    receive: (channel, func) =>
        ipcRenderer.on(channel, (event, ...args) => func(...args)),
    clearCache: () => ipcRenderer.invoke("clear-cache"),
    getCommand: () => ipcRenderer.invoke("get-command"),
    setCommand: (command) => ipcRenderer.invoke("set-command", command),
});

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    selectFolder: () => ipcRenderer.invoke("select-folder"),
    playVideo: (videoPath) => ipcRenderer.invoke("play-video", videoPath),
    receive: (channel, func) =>
        ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

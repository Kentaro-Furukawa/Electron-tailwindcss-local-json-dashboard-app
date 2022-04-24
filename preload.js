const { contextBridge, ipcRenderer } = require("electron");

const API = {
  adminLogin: (adminLog) => ipcRenderer.send("admin:login", adminLog),
}

contextBridge.exposeInMainWorld('api', API);
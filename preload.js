const { contextBridge, ipcRenderer } = require("electron");

const API = {
  adminLogin: (adminLog) => ipcRenderer.send("adminLoginAttempt", adminLog),
}

contextBridge.exposeInMainWorld('api', API);
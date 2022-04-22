const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
  'api',
  {
    admin: (adminLog) => ipcRenderer.send("admin:login", adminLog)
  }
);

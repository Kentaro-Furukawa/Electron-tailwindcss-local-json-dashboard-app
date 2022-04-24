const { contextBridge, ipcRenderer } = require("electron");

const ADMIN = {
    dirname: __dirname,
}

contextBridge.exposeInMainWorld('adminapi', ADMIN)
  
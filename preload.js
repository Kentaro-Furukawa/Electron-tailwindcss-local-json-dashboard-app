const { contextBridge, ipcRenderer } = require("electron");

const API = {
  onUserList: (callback) => ipcRenderer.on("sendUserList", (event, args) => callback(args)),
  adminLogin: (adminLog) => ipcRenderer.send("adminLoginAttempt", adminLog),
  sendRecord: (record) => ipcRenderer.invoke("send-record", record),
}

contextBridge.exposeInMainWorld('api', API);
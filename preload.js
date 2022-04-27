const { contextBridge, ipcRenderer } = require("electron");

const API = {
  onUserList: (callback) => ipcRenderer.on("send-user-list", (event, args) => callback(args)),
  getActiveRecord: (callback) => ipcRenderer.on("send-active-record", (event, args) => callback(args)),
  adminLogin: (adminLog) => ipcRenderer.send("admin-login-attempt", adminLog),
  sendRecord: (record) => ipcRenderer.invoke("send-record", record),
  onFlash: () => ipcRenderer.invoke("on-flash")
}

contextBridge.exposeInMainWorld('api', API);
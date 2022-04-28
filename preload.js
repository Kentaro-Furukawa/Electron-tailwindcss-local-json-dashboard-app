const { contextBridge, ipcRenderer } = require("electron");

const API = {
  onUserList: (callback) => ipcRenderer.on("send-user-list", (event, args) => callback(args)),
  adminLogin: (adminLog) => ipcRenderer.send("admin-login-attempt", adminLog),
  getActiveRecord: (callback) => ipcRenderer.on("send-active-record", (event, args) => callback(args)),
  sendRecord: (record) => ipcRenderer.invoke("send-record", record),
  requestActiveRecord: () => ipcRenderer.invoke("request-active-record"),
  onFlash: () => ipcRenderer.invoke("on-flash")
}

contextBridge.exposeInMainWorld('api', API);
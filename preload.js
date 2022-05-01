const { contextBridge, ipcRenderer } = require("electron");

const API = {
  onUserList: (callback) => ipcRenderer.on("send-user-list", (event, args) => callback(args)),
  adminLogin: (adminLog) => ipcRenderer.send("admin-login-attempt", adminLog),
  getActiveRecord: (callback) => ipcRenderer.once("send-active-record", (event, args) => callback(args)),
  sendRecord: (record) => ipcRenderer.invoke("send-record", record),
  requestActiveRecord: () => ipcRenderer.invoke("request-active-record"),
  delTagRecord: (record) => ipcRenderer.invoke("delete-tag-record", record),
  onFlash: () => ipcRenderer.invoke("on-flash")
}

contextBridge.exposeInMainWorld('api', API);
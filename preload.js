const { contextBridge, ipcRenderer } = require("electron");

const API = {
  adminLogin: (adminLog) => ipcRenderer.send("admin-login-attempt", adminLog),
  requestUserList: () => ipcRenderer.invoke("send-user-list"),
  updateUserList: (newList) => ipcRenderer.send("update-user-list", newList),
  requestActiveRecord: () => ipcRenderer.invoke("request-active-record"),
  sendRecord: (record) => ipcRenderer.invoke("send-record", record),
  delTagRecord: (record) => ipcRenderer.invoke("delete-tag-record", record),
  onFlash: () => ipcRenderer.invoke("on-flash"),
  exportJson: (date) => ipcRenderer.send("export-json", date)
}

contextBridge.exposeInMainWorld('api', API);
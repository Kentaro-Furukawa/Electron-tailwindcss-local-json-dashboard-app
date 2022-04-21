const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const createMainWindow = () => {
    const mainWindow = new BrowserWindow({
      width: 600,
      height: 630,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
    mainWindow.loadFile('index.html')
  }

  const createAdminWindow = () => {
    const adminWindow = new BrowserWindow({
      width: 400,
      height: 400,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
    adminWindow.loadFile('admin.html')
  }
  
  app.whenReady().then(() => {
    createMainWindow()
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  ipcMain.on("admin:login", (event, loginData) => {
    console.log(loginData.user);
    console.log(loginData.time);
    createAdminWindow()
  });
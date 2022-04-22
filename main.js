const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');


const current = new Date();
const currentYear = current.getFullYear();
const currentMonth = ('0' + current.getMonth()).slice(-2);
const archiveFilename = `archive-${currentYear}-${currentMonth}.json`;
// const initUserContent = JSON.stringify({ name: 'admin' });

const initDirs = [
  { dir: "active", files: ["activeRecord.json"], content: "" },
  { dir: "archive", files: [archiveFilename], content: "" },
  { dir: "log", files: ["activeLog.json", "adminLog.json", "errorLog.json"], content: "" },
  { dir: "user", files: ["user.text"], content: "admin" }
];

const dataDir = path.join(__dirname, '.app-data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, (err) => {
    if (err) throw err;
  });
  initDirs.forEach((initDir) => {
    fs.mkdir(path.join(dataDir, initDir.dir), (err) => {
      if (err) throw err;
    });
  });
} else {
  initDirs.forEach((initDir) => {
    if (!fs.existsSync(path.join(dataDir, initDir.dir))) {
      fs.mkdir(path.join(dataDir, initDir.dir), (err) => {
        if (err) throw err;
      });
    }
  });
}




// const initDir = async () => {
//   try {
//     await fsPromises.writeFile(path.join(__dirname, 'init.txt'), 'initial text file');
//     console.log('write');
//   } catch (error) {
//       console.error(error);
//   }
// }







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
    width: 950,
    height: 680,
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

ipcMain.on("admin:login", (event, adminLog) => {
  console.log(adminLog.username);
  console.log(adminLog.date);
  console.log('Admin login Success');
  createAdminWindow()
});
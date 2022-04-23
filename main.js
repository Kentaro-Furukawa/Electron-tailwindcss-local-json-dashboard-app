const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const current = new Date();
const currentYear = current.getFullYear();
const currentMonth = ("0" + (current.getMonth() + 1)).slice(-2);
const archiveFilename = `archive-${currentYear}-${currentMonth}.json`;

const initDirs = [
  { dir: "active", files: ["activeRecord.json"], content: "fdfd" },
  { dir: "archive", files: [archiveFilename], content: "arc" },
  { dir: "log", files: ["activeLog.json", "adminLog.json", "errorLog.json"], content: "log" },
  { dir: "user", files: ["user.txt"], content: "admin" }
];

const dataDir = path.join(__dirname, '.app-data');

// checkInitDirs
if (!fs.existsSync(dataDir)) {
  const mkInitDirs = () => {
    fs.mkdirSync(dataDir);
    initDirs.forEach((initDir) => {
    fs.mkdirSync(path.join(dataDir, initDir.dir));
    });
  };
  mkInitDirs();
  
} else {
  initDirs.forEach((initDir) => {
    if (!fs.existsSync(path.join(dataDir, initDir.dir))) {
      fs.mkdirSync(path.join(dataDir, initDir.dir), (err) => {
        if (err)
          throw err;
      });
    }
  });
};

// checkInitFiles
initDirs.forEach((initDir) => {
  const targetDir = initDir.dir;
  const targetFiles = initDir.files;
  targetFiles.forEach((targetFile) => {
    if (!fs.existsSync(path.join(dataDir, targetDir, targetFile))) {
      console.log(path.join(dataDir, targetDir, targetFile));
      fs.openSync(path.join(dataDir, targetDir, targetFile), 'a')
    }
  });
});



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
  console.log('Admin login Success: ', adminLog.username, adminLog.date);
  createAdminWindow()
});
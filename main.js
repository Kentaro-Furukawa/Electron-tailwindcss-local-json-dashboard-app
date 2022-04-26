const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
// const fsPromises = require('fs').promises;
const path = require('path');
const current = new Date();
const currentYear = current.getFullYear();
const currentMonth = ("0" + (current.getMonth() + 1)).slice(-2);
const archiveFilename = `archive-${currentYear}-${currentMonth}.json`;
let userList = Array;

const initDirs = [
  { dir: "active", files: ["activeRecord.json"] },
  { dir: "archive", files: [archiveFilename] },
  { dir: "log", files: ["activeLog.json", "adminLog.json", "errorLog.json"] },
  { dir: "user", files: ["user.txt"] }
];

const dataDir = path.join(__dirname, '.app-data');

// make initial dirs
initDirs.forEach((initDir) => {
  fs.mkdirSync(path.join(dataDir, initDir.dir), { recursive: true })
});
// make initial files
initDirs.forEach((initDir) => {
  initDir.files.forEach((file) => {
    fs.closeSync(fs.openSync(path.join(dataDir, initDir.dir, file), 'a' ))
  });
});

const getUserList = () => {
  // if user.txt is empty add "admin"
  let userData = fs.readFileSync(path.join(dataDir, "user", "user.txt"), 'utf-8', (err) => {
    if (err) throw err;
  })
  if (userData.trim().length === 0) {
    fs.writeFileSync(path.join(dataDir, "user", "user.txt"), "admin", (err) => {
      if (err) throw err;
    })
  }
  //create user array
  userTxtData = fs.readFileSync(path.join(dataDir, "user", "user.txt"), 'utf-8', (err) => {
    if (err) throw err;
  })
  const userList = userTxtData.toString().trim().split("\n");
  return userList
};

// *************************************************

const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 630,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.loadFile('index.html')
  mainWindow.webContents.openDevTools();

  userList = getUserList();
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("sendUserList", userList);
  })
};

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

ipcMain.on("adminLoginAttempt", (event, adminLog) => {
  console.log('Admin login Success: ', adminLog.username, adminLog.date);
  userList = getUserList();
  console.log(userList);
  createAdminWindow()
});

ipcMain.handle("send-record", async (event, record) => {
  console.log(record)

  return "return from main process!!!"
})
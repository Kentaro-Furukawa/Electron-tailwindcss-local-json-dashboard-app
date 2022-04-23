const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const current = new Date();
const currentYear = current.getFullYear();
const currentMonth = ("0" + (current.getMonth() + 1)).slice(-2);
const archiveFilename = `archive-${currentYear}-${currentMonth}.json`;

const initDirs = [
  { dir: "active", files: ["activeRecord.json"] },
  { dir: "archive", files: [archiveFilename] },
  { dir: "log", files: ["activeLog.json", "adminLog.json", "errorLog.json"] },
  { dir: "user", files: ["user.txt"] }
];

const dataDir = path.join(__dirname, '.app-data');

const mkInitDirs = async () => {
  try {
    for await (const initDir of initDirs) {
      await fsPromises.mkdir(path.join(dataDir, initDir.dir), { recursive: true });
      for await (const file of initDir.files) {
        fsPromises.open(path.join(dataDir, initDir.dir, file), 'a');
      }
    }
    const userData = await fsPromises.readFile(path.join(dataDir, "user", "user.txt"), { encoding: 'utf8' });
    if (userData.trim().length === 0) {
      await fsPromises.writeFile(path.join(dataDir, "user", "user.txt"), 'admin');
    }
  } catch (err) {
    console.error(err);
  }
}

mkInitDirs();



// //create user array
// userTxtData = fs.readFileSync(path.join(dataDir, "user", "user.txt"), 'utf-8', (err) => {
//   if (err) throw err;
// })
// const userArray = userTxtData.toString().trim().split("\n")
// return userArray
// }
// getUserList();
// console.log(getUserList())

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
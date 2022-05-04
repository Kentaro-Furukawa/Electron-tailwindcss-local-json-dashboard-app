const { app, BrowserWindow, ipcMain, clipboard} = require('electron');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const { stringify } = require('querystring');

const current = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo'});
const currentYear = current.slice(0, 4);
const currentMonth = ("0" +current.slice(5, current.lastIndexOf("/"))).slice(-2);
const currentDate = ("0" +current.slice(current.lastIndexOf("/")+1, current.indexOf(" "))).slice(-2);
const todayInt = parseInt(currentYear + currentMonth + currentDate);
const archiveFilename = `archive-${currentYear}-${currentMonth}.json`;
let userList = Array;
let activateRecordData = Object;

const initDirs = [
  { dir: "active", files: ["activeRecord.json"] },
  { dir: "archive", files: [archiveFilename] },
  { dir: "log", files: ["activeLog.json", "adminLog.json", "errorLog.json"] },
  { dir: "user", files: ["user.json"] }
];

const dataDir = path.join(__dirname, '.app-data');

// make initial dirs
initDirs.forEach((initDir) => {
  fs.mkdirSync(path.join(dataDir, initDir.dir), { recursive: true })
});
// make initial files
initDirs.forEach((initDir) => {
  initDir.files.forEach((file) => {
    const targetFilePath = path.join(dataDir, initDir.dir, file);
    const targetFile = fs.openSync(targetFilePath, 'a');
    const targetFileData = fs.readFileSync(targetFilePath, 'utf-8');
    if (file === "user.json" && targetFileData.trim().length === 0) {
      fs.writeFileSync(targetFile, '["admin"]');
    } else if (targetFileData.trim().length === 0) {
      fs.writeFileSync(targetFile, '[]');
    }
    fs.closeSync(targetFile);
  });
});
const getUserList = () => {
  let userData = fs.readFileSync(path.join(dataDir, "user", "user.json"), 'utf-8', (err) => { if (err) throw err; });
  userData = JSON.parse(userData)
  if (userData.length === 0) { userData.push('admin') };
  const userJsonData = JSON.stringify(userData, null, 2)
    fs.writeFileSync(path.join(dataDir, "user", "user.json"), userJsonData);
  return userData;
};

const getActiveRecord = () => {
  let activateRecordData = fs.readFileSync(path.join(dataDir, "active", "activeRecord.json"), 'utf8', (err) => {
    if (err) throw err;
  });
  activateRecordData = JSON.parse(activateRecordData);
  activateRecordData = activateRecordData.filter((record) => parseInt(record.time.slice(0, 10).replaceAll("-", "")) === todayInt );
  const jsonActiveRecordData = JSON.stringify(activateRecordData, null, 2)
  fs.writeFile(path.join(dataDir, "active", "activeRecord.json"), jsonActiveRecordData, (err) => {
    if (err) throw err;
  });
  return activateRecordData;
};


// *************************************************

const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 550,
    height: 630,
    minWidth: 550,
    minHeight: 630,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.loadFile('index.html')
  mainWindow.webContents.openDevTools();

  userList = getUserList();
  activateRecordData = getActiveRecord();
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("send-user-list", userList);
    // mainWindow.webContents.send("send-active-record", activateRecordData);
  })
};

const createAdminWindow = () => {
  const adminWindow = new BrowserWindow({
    width: 950,
    height: 680,
    minWidth: 700,
    minHeight: 630,
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

ipcMain.on("admin-login-attempt", (event, adminLog) => {
  console.log('Admin login Success: ', adminLog);
  userList = getUserList();
  console.log(userList);
  createAdminWindow()
});

ipcMain.handle("send-user-list", async (event) => {
  const userList = getUserList();
  return userList;
})

ipcMain.handle("send-record", async (event, record) => {
  let returnMessage = null;
  let duplicateRecord = [];
  let incTaken = false;
  let filterActiveRecord = null;
  const inputUsername = record.username;
  const inputIncNo = record.incNo;
  activateRecordData = await fs.promises.readFile(path.join(dataDir, "active", "activeRecord.json"), 'utf8');
  activateRecordData = JSON.parse(activateRecordData);
  inputIncNo.forEach((incNo) => {
    filterActiveRecord = activateRecordData.filter(activeRecord => activeRecord.incNo.includes(incNo) && !(activeRecord.username === inputUsername));
    duplicateRecord = [...duplicateRecord, ...filterActiveRecord];
  })

  if (duplicateRecord.length > 0) {
    returnMessage = "it is taken."
    incTaken = true;
  } else {
    returnMessage = "going to add to active record"
    incTaken = false;
    // push to activeRecord json file if tagOn is false
    if (!(record.tagOn)) {
    activateRecordData = activateRecordData.filter((activeRecord => activeRecord.username !== inputUsername || activeRecord.tagOn === true))
    }
    activateRecordData.push(record);
    activateRecordData = JSON.stringify(activateRecordData, null, 2)
    await fsPromises.writeFile(path.join(dataDir, "active", "activeRecord.json"), activateRecordData);

    // push to archive json file
    let archiveData = await fsPromises.readFile(path.join(dataDir, "archive", archiveFilename), 'utf8');
    archiveData = JSON.parse(archiveData);
    archiveData.push(record);
    archiveData = JSON.stringify(archiveData, null, 2)
    await fsPromises.writeFile(path.join(dataDir, "archive", archiveFilename), archiveData);
  }
  let returnActiveRecord = await fs.promises.readFile(path.join(dataDir, "active", "activeRecord.json"), 'utf8');
  returnActiveRecord = JSON.parse(returnActiveRecord);

  return {
    'activeRecord': returnActiveRecord,
    'duplicateRecord': duplicateRecord,
    'incTaken': incTaken
  };
})

ipcMain.handle("request-active-record", async (event) => {
  let activateRecordData = await fs.promises.readFile(path.join(dataDir, "active", "activeRecord.json"), 'utf8');
  activateRecordData = JSON.parse(activateRecordData);
  return activateRecordData;
})

ipcMain.handle("delete-tag-record", async (event, delRcd) => {
  let activateRecordData = await fs.promises.readFile(path.join(dataDir, "active", "activeRecord.json"), 'utf8');
  activateRecordData = JSON.parse(activateRecordData);
  const filteredActivateRecord = activateRecordData.filter((ard) => 
  !(ard.username === delRcd.username && ard.time === delRcd.time && ard.inputValue === delRcd.inputValue))
  const faJson = JSON.stringify(filteredActivateRecord, null, 2)
    await fsPromises.writeFile(path.join(dataDir, "active", "activeRecord.json"), faJson);
    return filteredActivateRecord;
})

ipcMain.handle("on-flash", async (event) => {
  const copiedItem = clipboard.readText()
  return copiedItem;
})


const { app, shell, Menu, ipcMain, BrowserWindow, Tray, nativeImage } = require('electron')
const path = require("path")
var AutoLaunch = require('auto-launch');

let win
let tray = null;

function showNotification() {
  win.show();
}
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    width: 600,
    height: 270,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    minimizable: false,
    maximizable: false
  })

  // and load the index.html of the app.
  win.loadFile('index.html');
  win.setSkipTaskbar(true);

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}
const gotTheLock = app.requestSingleInstanceLock();  //Second Instance Lock

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    win.webContents.send("Second Instance");
    return;
  })
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  //showNotification();  
  /*showNotification() is commented because window should not popup when program starts
  Uncomment only when testing the look of the window.
  */

  // The follwing code is responsible for auto launch.
  var BreakTimeAutoLauncher = new AutoLaunch({
    name: 'Breaktime',
    path: app.getPath("exe"),
  });
  BreakTimeAutoLauncher.enable();
  const iconPath = path.join(__dirname, 'icon128.png');
  tray = new Tray(nativeImage.createFromPath(iconPath));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Visit Page", click: function () {
        shell.openExternal("https://aadityajoshi151.github.io/Breaktime/")
      }
    },
    {type: "separator"},
    {
      label: "Exit Breaktime", click: function () {
        win.webContents.send("ConfirmExit");
      }
    },
  ])
  tray.setToolTip('Breaktime')
  tray.setContextMenu(contextMenu)
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})
//renderer sends message to this piece of code to show the notification window
ipcMain.on('notify', (event, arg) => {
  showNotification();
})
//renderer sends message to this piece of code to hide the notification window
ipcMain.on('hide', (event, arg) => {
  win.hide();
})

ipcMain.on('Quit', (event, arg) => {
  app.quit();
})
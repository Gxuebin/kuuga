const { app, BrowserWindow, ipcMain, Menu, Tray, shell, dialog } = require('electron')
const { resolve } = require('path')
const Store = require('electron-store')
const fs = require('fs')
const { getTrayMenu, getMainMenu } = require('./menus')
const { currentVersion, versionDiff, autoUpdate } = require('./autoUpdate')

const store = new Store()

const USER_ICON_DIR = resolve(__dirname, './user_icons')
const APP_ICON_DIR = resolve(__dirname, './app_icons')
const DEFAULT_ICON = `${APP_ICON_DIR}/default.png`
const WHITE_ICON = `${APP_ICON_DIR}/icon.png`
const TRAY_ICON = `${APP_ICON_DIR}/tray.png`

const WIN_MAP = {}

let window = null
let trayApp = null

let trayMenu = null
let mainMenu = null

function clearUserIconsDir () {
  let files = []
  if (fs.existsSync(USER_ICON_DIR)) {
    files = fs.readdirSync(USER_ICON_DIR)
    files.forEach((file, index) => {
      let curPath = USER_ICON_DIR + '/' + file
      if (fs.statSync(curPath).isDirectory()) {
        clearUserIconsDir(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
  }
  fs.writeFileSync(`${USER_ICON_DIR}/icons.txt`, '')
}

function trayMenuItemHandler (name, op) {
  let index

  trayMenu.forEach((item, i) => {
    if (item.label === name) {
      index = i
    }
  })

  if (op === 'unchecked') {
    trayMenu[index].checked = false
  } else if (op === 'checked') {
    trayMenu[index].checked = true
  } else if (op === 'delete') {
    trayMenu.splice(index, 1)
  } else if (op === 'add') {
    trayMenu.splice(0, 0, {
      label: name,
      type: 'checkbox',
      checked: true,
      click: function () {
        WIN_MAP[name].show()
        WIN_MAP[name].focus()
      }
    })
  }
  trayApp.setContextMenu(Menu.buildFromTemplate(trayMenu))
}

function createNewWin (appInfo) {
  const { name, url, iconPath } = appInfo

  if (WIN_MAP[name]) {
    WIN_MAP[name].show()
    return
  }
  const preBounds = store.get(`${url}_bounds`)
  if (!WIN_MAP[name]) {
    WIN_MAP[name] = new BrowserWindow(preBounds || {
      width: 1152,
      height: 720,
      title: 'Kuuga'
    })

    if (iconPath) {
      const localIconPath = `${USER_ICON_DIR}/${Math.random().toString(36).substr(2)}.png`
      fs.copyFileSync(iconPath, localIconPath)
      WIN_MAP[name].icon = localIconPath
    }
  }
  WIN_MAP[name].loadURL(url)

  trayMenuItemHandler(name, 'add')

  WIN_MAP[name].on('close', (e) => {
    e.preventDefault()
    const bounds = WIN_MAP[name].getBounds()
    store.set(`${url}_bounds`, bounds)
    WIN_MAP[name].hide()
    app.dock.setIcon(DEFAULT_ICON)
    trayApp.setTitle('Kuuga')
    trayMenuItemHandler(name, 'unchecked')
  })
  WIN_MAP[name].on('focus', () => {
    app.dock.setIcon(WIN_MAP[name].icon || WHITE_ICON)
    trayApp.setTitle(name)
    trayMenuItemHandler(name, 'checked')
  })
  WIN_MAP[name].on('blur', () => {
    trayMenuItemHandler(name, 'unchecked')
  })
}

async function checkUpdate () {
  let latestVersion = '1.0.0'
  let match = false
  if (process.env.NODE_ENV !== 'DEV') {
    const versionDiffResult = await versionDiff()
    latestVersion = versionDiffResult.latestVersion
    match = versionDiffResult.match
  }
  if (match) {
    dialog.showMessageBox(null, {
      icon: DEFAULT_ICON,
      type: 'info',
      message: `No new version availabled.`,
      detail: `Kuuga is in the latest version`,
      buttons: ['OK']
    })
  } else {
    dialog.showMessageBox(null, {
      icon: DEFAULT_ICON,
      type: 'question',
      message: `A new version of v.${latestVersion} is availabled.`,
      detail: `Update Kuuga right now?`,
      buttons: ['No', 'Yes'],
      defaultId: 1
    }, async (yes) => {
      if (yes) {
        await autoUpdate(window)
        app.relaunch()
        app.exit(0)
      }
    })
  }
}

function ipcMessager (window) {
  ipcMain.on('get-version', (event) => {
    event.sender.send('get-version-result', currentVersion)
  })

  ipcMain.on('createApp', (event, appInfo) => {
    createNewWin(appInfo)
  })

  ipcMain.on('deleteApp', (event, name) => {
    if (WIN_MAP[name]) {
      WIN_MAP[name].destroy()
      trayMenuItemHandler(name, 'delete')
    }
  })
}

async function createWindow () {
  window = new BrowserWindow({
    width: 520,
    height: 380,
    resizable: false,
    icon: DEFAULT_ICON,
    show: false
  })

  trayMenu = getTrayMenu({ window, shell, app, clearUserIconsDir })
  mainMenu = getMainMenu({ app, shell, currentVersion, checkUpdate, clearUserIconsDir })
  Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenu))

  if (process.env.NODE_ENV === 'DEV') {
    window.loadURL('http://localhost:8080/')
    window.webContents.openDevTools()
  } else {
    window.loadFile(resolve(__dirname, './index.html'))
  }

  ipcMessager(window)

  trayApp = new Tray(TRAY_ICON)
  trayApp.setContextMenu(Menu.buildFromTemplate(trayMenu))

  window.once('ready-to-show', () => {
    window.show()
  })
  window.on('focus', () => {
    app.dock.setIcon(DEFAULT_ICON)
    trayApp.setTitle('Kuuga')
  })
  window.on('minimize', function (event) {
    event.preventDefault()
    window.hide()
  })

  window.on('close', function (event) {
    if (!app.isQuiting) {
      event.preventDefault()
      window.hide()
    }
    return false
  })
}

app.on('ready', createWindow)

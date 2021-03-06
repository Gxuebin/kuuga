const { app, BrowserWindow, ipcMain, Menu, Tray, shell, dialog } = require('electron')
const { resolve } = require('path')
const Store = require('electron-store')
const fs = require('fs')
const { getTrayMenu, getMainMenu } = require('./menus')
const { currentVersion, versionDiff, autoUpdate } = require('./autoUpdate')
const { platform } = require('process')

const store = new Store()

const USER_ICON_DIR = resolve(__dirname, './user_icons')
const APP_ICON_DIR = resolve(__dirname, './app_icons')
const DEFAULT_ICON = `${APP_ICON_DIR}/default.png`
const WHITE_ICON = `${APP_ICON_DIR}/icon.png`
const TRAY_ICON = `${APP_ICON_DIR}/tray.png`

const WIN_MAP = {}
const ONOPEN_WINS = new Set()

let window = null
let trayApp = null

let trayMenu = null
let mainMenu = null

function isMac () {
  return platform === 'darwin'
}

function dockIconHandler (op, name) {
  if (op === '+') {
    ONOPEN_WINS.add(name)
  } else {
    ONOPEN_WINS.delete(name)
  }
  if (ONOPEN_WINS.size) {
    app.dock && app.dock.show()
  } else {
    app.dock && app.dock.hide()
  }
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
        dockIconHandler('+', name)
      }
    })
  }
  trayApp.setContextMenu(Menu.buildFromTemplate(trayMenu))
}

function createNewWin (appInfo) {
  const { name, url, iconPath } = appInfo

  if (WIN_MAP[name]) {
    WIN_MAP[name].show()
    dockIconHandler('+', name)
    return
  }
  const preBounds = store.get(`${url}_bounds`)
  if (!WIN_MAP[name]) {
    WIN_MAP[name] = new BrowserWindow(preBounds || {
      width: 1152,
      height: 720,
      title: 'Kuuga'
    })

    dockIconHandler('+', name)

    if (iconPath) {
      WIN_MAP[name].icon = iconPath
    }
  }
  WIN_MAP[name].loadURL(url)

  trayMenuItemHandler(name, 'add')

  WIN_MAP[name].on('close', (e) => {
    e.preventDefault()
    const bounds = WIN_MAP[name].getBounds()
    store.set(`${url}_bounds`, bounds)
    WIN_MAP[name].hide()
    app.dock && app.dock.setIcon(DEFAULT_ICON)
    trayApp.setTitle('Kuuga')
    trayMenuItemHandler(name, 'unchecked')

    dockIconHandler('-', name)
  })
  WIN_MAP[name].on('focus', () => {
    app.dock && app.dock.setIcon(WIN_MAP[name].icon || WHITE_ICON)
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

  ipcMain.on('create-app', (event, appInfo) => {
    createNewWin(appInfo)
  })

  ipcMain.on('delete-app', (event, name) => {
    if (WIN_MAP[name]) {
      WIN_MAP[name].destroy()
      trayMenuItemHandler(name, 'delete')
    }
  })

  ipcMain.on('set-icon', (event, path) => {
    const localIconPath = `${USER_ICON_DIR}/${path.split('/').pop()}`
    fs.stat(path, (err, stats) => {
      if (!err) {
        try {
          fs.copyFileSync(path, localIconPath)
          event.sender.send('set-icon-result', localIconPath)
        } catch {}
      }
    })
  })
}

async function createWindow () {
  window = new BrowserWindow({
    width: isMac() ? 520 : 530,
    height: isMac() ? 380 : 400,
    resizable: false,
    icon: DEFAULT_ICON,
    show: false
  })

  trayMenu = getTrayMenu({ window, shell, app })
  mainMenu = getMainMenu({ app, shell, currentVersion, checkUpdate })
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
    app.dock && app.dock.setIcon(DEFAULT_ICON)
    trayApp.setTitle('Kuuga')
  })
  window.on('minimize', (event) => {
    event.preventDefault()
    window.hide()
  })

  window.on('show', () => {
    dockIconHandler('+', 'main')
  })

  window.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault()
      window.hide()
      dockIconHandler('-', 'main')
    }
    return false
  })
}

app.on('ready', createWindow)

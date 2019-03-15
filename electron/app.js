const { app, BrowserWindow, ipcMain, Menu, Tray, shell } = require('electron')
const { resolve } = require('path')
const { versionDiff, autoUpdate } = require('./autoUpdate')
const Store = require('electron-store')
const store = new Store()
const { getTrayMenu, getMainMenu } = require('./menus')

const defaultIconPath = resolve(__dirname, './default.png')
const trayIconPath = resolve(__dirname, './tray.png')

let window = null
let trayApp = null

let trayMenu = null
let mainMenu = null

const winMap = {}

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
        winMap[name].show()
        winMap[name].focus()
      }
    })
  }
  trayApp.setContextMenu(Menu.buildFromTemplate(trayMenu))
}

function createNewWin (appInfo) {
  const { name, url, iconPath } = appInfo
  if (winMap[name]) {
    winMap[name].show()
    return
  }
  const preBounds = store.get(`${url}_bounds`)
  if (!winMap[name]) {
    winMap[name] = new BrowserWindow(preBounds || {
      width: 1152,
      height: 720,
      title: 'Kuuga'
    })
  }
  winMap[name].loadURL(url)

  trayMenuItemHandler(name, 'add')

  winMap[name].on('close', (e) => {
    e.preventDefault()
    const bounds = winMap[name].getBounds()
    store.set(`${url}_bounds`, bounds)
    winMap[name].hide()
    app.dock.setIcon(defaultIconPath)
    trayApp.setTitle('Kuuga')
    trayMenuItemHandler(name, 'unchecked')
  })
  winMap[name].on('focus', () => {
    app.dock.setIcon(iconPath || resolve(__dirname, './icon.png'))
    trayApp.setTitle(name)
    trayMenuItemHandler(name, 'checked')
  })
  winMap[name].on('blur', () => {
    trayMenuItemHandler(name, 'unchecked')
  })
}

function ipcMessager (window) {
  ipcMain.on('check-update', async (event) => {
    event.returnValue = await versionDiff()
  })

  ipcMain.on('update-version', async (event) => {
    const updateResult = await autoUpdate(window)
    event.sender.send('update-result', updateResult)
    app.relaunch()
    app.exit(0)
  })

  ipcMain.on('relaunch', () => {
    app.relaunch()
    app.exit(0)
  })

  ipcMain.on('close', () => {
    app.quit()
  })

  ipcMain.on('createApp', (event, appInfo) => {
    createNewWin(appInfo)
  })

  ipcMain.on('deleteApp', (event, name) => {
    winMap[name].destroy()
    trayMenuItemHandler(name, 'delete')
  })
}

async function createWindow () {
  window = new BrowserWindow({
    width: 520,
    height: 380,
    resizable: false,
    icon: defaultIconPath,
    show: false
  })

  trayMenu = getTrayMenu({ window, shell, app })
  mainMenu = getMainMenu({ shell })
  Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenu))

  if (process.env.NODE_ENV === 'DEV') {
    window.loadURL('http://localhost:8080/')
    window.webContents.openDevTools()
  } else {
    window.loadFile(resolve(__dirname, './index.html'))
  }

  ipcMessager(window)

  trayApp = new Tray(trayIconPath)
  trayApp.setContextMenu(Menu.buildFromTemplate(trayMenu))

  window.once('ready-to-show', () => {
    window.show()
  })
  window.on('focus', () => {
    app.dock.setIcon(defaultIconPath)
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
app.on('window-all-closed', () => {
  app.quit()
})

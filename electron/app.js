const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron')
const { resolve } = require('path')
const fs = require('fs')
const png2icons = require('png2icons')
const pack = require('./pack')
const { versionDiff, autoUpdate } = require('./autoUpdate')

let window = null

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

  ipcMain.on('uploadImg', (event, path) => {
    const input = fs.readFileSync(path)
    const icns = png2icons.PNG2ICNS(input, png2icons.BILINEAR, 0)
    const ico = png2icons.createICO(input, png2icons.BEZIER, 20, true)
    fs.writeFileSync(resolve(__dirname, './template/icon.icns'), icns)
    fs.writeFileSync(resolve(__dirname, './template/icon.ico'), ico)
  })

  ipcMain.on('deleteImg', () => {
    fs.unlinkSync(resolve(__dirname, './template/icon.icns'))
    fs.unlinkSync(resolve(__dirname, './template/icon.ico'))
  })

  ipcMain.on('generateApp', (event, appInfo) => {
    fs.writeFileSync(resolve(__dirname, './template/config.json'), JSON.stringify(appInfo, null, 2))
    pack('mac', (msg) => {
      event.sender.send('generate-result', msg)
      if (/DONE/.test(msg)) {
        fs.writeFileSync(resolve(__dirname, './template/config.json'), '')
      }
    })
  })
}

const menus = Menu.buildFromTemplate([
  {
    label: 'Kuuga',
    submenu: [{
      label: 'About',
      click () {
        shell.openExternal('https://github.com/jrainlau/kuuga')
      }
    }, {
      type: 'separator'
    }, {
      role: 'toggledevtools'
    }, {
      type: 'separator'
    }, {
      role: 'reload'
    }, {
      role: 'quit'
    }]
  }, {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  }
])

async function createWindow () {
  Menu.setApplicationMenu(menus)

  window = new BrowserWindow({
    width: 500,
    height: 360,
    transparent: true,
    frame: false
  })

  ipcMessager(window)

  if (process.env.NODE_ENV === 'DEV') {
    window.loadURL('http://localhost:8080/')
    window.webContents.openDevTools()
  } else {
    window.loadFile(resolve(__dirname, './index.html'))
  }
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  app.quit()
})

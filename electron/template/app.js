const { app, BrowserWindow, Menu, shell } = require('electron')
const config = require('./config.json')
const Store = require('electron-store')
const store = new Store()

let window = null

const menus = Menu.buildFromTemplate([
  {
    label: 'Kuuga',
    submenu: [{
      label: 'About',
      click () {
        shell.openExternal('https://github.com/jrainlau/kaleido')
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
  const bound = store.get('bound')

  window = new BrowserWindow(bound || {
    width: 1152,
    height: 720
  })

  window.on('close', () => {
    store.set('bound', window.getBounds())
  })

  window.loadURL(config.url)
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  app.quit()
})

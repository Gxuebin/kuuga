exports.getTrayMenu = ({ window, shell, app }) => {
  return [
    {
      label: 'Show Kuuga',
      click: function () {
        window.show()
      }
    },
    {
      label: 'About',
      click () {
        shell.openExternal('https://github.com/jrainlau/kuuga')
      }
    },
    {
      type: 'separator'
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: function () {
        app.isQuiting = true
        app.quit()
      }
    }
  ]
}

exports.getMainMenu = ({ shell }) => {
  return [
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
  ]
}

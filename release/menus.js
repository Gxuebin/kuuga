exports.getTrayMenu = ({ app, window, shell }) => {
  return [
    {
      type: 'separator'
    },
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
      label: 'Quit',
      click: function () {
        app.isQuiting = true
        app.exit()
      }
    }
  ]
}

exports.getMainMenu = ({ app, shell, currentVersion, checkUpdate }) => {
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
        label: 'Version',
        submenu: [
          {
            label: 'v.' + currentVersion
          },
          {
            label: 'Check for updates',
            click: checkUpdate
          }
        ]
      }, {
        type: 'separator'
      }, {
        role: 'reload'
      }, {
        label: 'Quit',
        click: function () {
          app.isQuiting = true
          app.exit()
        }
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

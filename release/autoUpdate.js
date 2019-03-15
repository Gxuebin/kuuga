const https = require('https')
const fs = require('fs')
const { resolve } = require('path')

const RELEASE_BASE = 'https://raw.githubusercontent.com/jrainlau/kuuga/master/release'
const RELEASE_INFO = 'package.json'
const RELEASE_UPDATOR = 'autoUpdate.js'
const RELEASE_ELECTRON_MAIN = 'app.js'
const RELEASE_RENDER_MAIN_JS = 'js/app.js'
const RELEASE_RENDER_MAIN_JS_CHUNK = 'js/chunk-vendors.js'
const RELEASE_RENDER_MAIN_CSS = 'css/app.css'
const RELEASE_RENDER_MAIN_CSS_CHUNK = 'css/chunk-vendors.css'
const RELEASE_RENDER_ICON = 'icon.png'
const RELEASE_RENDER_DEFAULT_ICON = 'default.png'
const RELEASE_RENDER_TRAY_ICON = 'tray.png'

const currentVersion = JSON.parse(fs.readFileSync(resolve(__dirname, './package.json'))).version

function getReleaseFile (file) {
  const requestUrl = `${RELEASE_BASE}/${file}?r=${Math.random()}`
  return new Promise((resolve, reject) => {
    https.get(requestUrl, (res) => {
      const statusCode = res.statusCode

      if (statusCode !== 200) {
        reject(statusCode)
        res.resume()
        return
      }

      res.setEncoding('utf8')
      let rawData = ''
      res.on('data', (chunk) => {
        rawData += chunk
      })

      res.on('end', () => {
        resolve(rawData)
      }).on('error', (e) => {
        reject(e)
      })
    })
  })
}

async function versionDiff () {
  const latestVersion = JSON.parse(await getReleaseFile(RELEASE_INFO)).version
  return { latestVersion, currentVersion, match: latestVersion === currentVersion }
}

async function autoUpdate (window) {
  const { currentVersion, latestVersion, match } = await versionDiff()
  if (!match) {
    [
      RELEASE_INFO,
      RELEASE_UPDATOR,
      RELEASE_ELECTRON_MAIN,
      RELEASE_RENDER_MAIN_JS,
      RELEASE_RENDER_MAIN_JS_CHUNK,
      RELEASE_RENDER_MAIN_CSS,
      RELEASE_RENDER_MAIN_CSS_CHUNK,
      RELEASE_RENDER_ICON,
      RELEASE_RENDER_DEFAULT_ICON,
      RELEASE_RENDER_TRAY_ICON
    ].forEach(async path => {
      window.webContents.send('updating', `Update ${path}...`)
      const file = await getReleaseFile(path, window)
      if (process.env.NODE_ENV !== 'DEV') {
        fs.writeFileSync(resolve(__dirname, `./${path}`), file)
      }
    })
    window.webContents.send('updating', `Update finished!`)

    return {
      update: 'successed',
      version: latestVersion
    }
  } else {
    return {
      update: 'failed',
      version: currentVersion
    }
  }
}

module.exports = {
  currentVersion,
  versionDiff,
  autoUpdate
}

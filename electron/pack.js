const { exec } = require('child_process')
const { resolve } = require('path')
const fs = require('fs')

const execCmd = (cmd) => {
  return new Promise((resolve, reject) => {
    console.log(`🏃 Running command "${cmd}"`)
    exec(cmd, (err, stout, sterr) => {
      if (err) {
        console.error(sterr)
        reject(sterr)
      }
      console.log(stout)
      resolve(stout)
    })
  })
}

const pack = async (platform, cb) => {
  const config = require('./template/config.json')
  const dirPathArr = config.dirPath.split('/')
  const dirName = dirPathArr.pop()
  const dirPath = dirPathArr.join('/')
  let msg = `PACK: Packaging platform: ${platform}`
  cb(msg)
  msg = `PACK: Change directory to "${resolve(__dirname, './template')}"`
  cb(msg)
  process.chdir(resolve(__dirname, './template'))
  msg = `PACK: Running command "npm install"`
  cb(msg)
  await execCmd('npm install')
  const buildCommand = platform === 'win'
    ? `electron-packager . ${config.name} --platform=win32 --icon=./icon.ico --overwrite --out=${dirPath}`
    : `electron-packager . ${config.name} --platform=darwin --icon=./icon.icns --overwrite --out=${dirPath}`
  msg = `PACK: Building...`
  cb(msg)
  await execCmd(buildCommand)
  fs.renameSync(`${dirPath}/${config.name}-darwin-x64`, `${dirPath}/${dirName}`)
  msg = 'DONE: Packaging done!'
  cb(msg)
}

module.exports = pack

const CopyWebpackPlugin = require('copy-webpack-plugin')
const { resolve } = require('path')

module.exports = {
  outputDir: resolve(__dirname, './release'),
  publicPath: process.env.NODE_ENV === 'production' ? `././` : '/',
  filenameHashing: false,
  configureWebpack: process.env.NODE_ENV === 'production'
    ? {
      plugins: [
        new CopyWebpackPlugin([{
          from: './icon.icns', to: './'
        }, {
          from: './package.json', to: './'
        }, {
          from: './electron/*.js', to: '[name].[ext]'
        }, {
          from: './electron/app_icons', to: './app_icons'
        }, {
          from: './electron/user_icons', to: './user_icons'
        }])
      ]
    }
    : {}
}

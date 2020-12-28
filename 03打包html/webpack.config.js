/**
 * loader: 1、下载  2、使用（配置loader）
 * plugins: 1、下载 2、引入 3、使用
 */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
    publicPath: '../'
  },
  module: {
    rules: []
  },
  plugins: [
    // 重新打包时自动清除dist下的html文件以及引入的文件
    new CleanWebpackPlugin(),
    // html-webpack-plugin
    // 功能：默认会创建一个空的html, 自动引入打包输出的所有资源(JS/CSS)
    // 需求：需要使用带结构的HTML文件
    new HtmlWebpackPlugin({
      title: '打包html',
      // 复制 ./src/index.html文件，并自动引入打包输出的所有资源（JS/CSS）
      template: './src/index.html',
    })
  ],
  mode: 'development'
}
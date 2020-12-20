const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      // html压缩
      minify: {
        // 移除空格
        collapseWhitespace: true,
        // 移除注释
        removeComments: true
      }
    })
  ],
  // production 生产模式会自动压缩js代码
  mode: 'production'
}
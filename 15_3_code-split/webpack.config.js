
var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin

module.exports = {
  // 多入口：有几个入口，最终输出就有几个个bundle，但是比较麻烦
  // entry: {
  //   main: './src/js/index.js',
  //   print: './src/js/print.js'
  // },
  entry: './src/js/index.js', //  会将index与print打印为一个文件
  output: {
    // [name]: 取文件名，就是entry指定的文件名,
    filename: 'js/[name].[contenthash:10].js',
    path: path.resolve(__dirname, 'build')
  },
  // plugin
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      // html压缩
      minify: {
        // 移除空格
        collapseWhitespace: true,
        // 移除注释
        removeComments: true
      }
    }),
  ],
  /**
   * 可以将node_modules中的代码单独打包给一个chunk最终输出
   */
  optimization: {
    splitChunks: {
      // 引入的lodash第三方库，单独打包为了一个js文件
      chunks: 'all'
    }
  },
  // production 生产模式会自动压缩js代码
  mode: 'production',
  devtool: 'source-map'
}
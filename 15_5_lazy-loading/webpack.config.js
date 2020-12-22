
var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin

module.exports = {
  entry: './src/js/index.js', //  会将index与print打印为一个文件
  output: {
    // [name]: 取文件名，就是entry指定的文件名,
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  // plugin
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  // production 生产模式会自动压缩js代码
  mode: 'development',
  devtool: 'source-map'
}

/**
 * 懒加载：延迟加载模块，使用到模块的时候才加载
 * 实现：import 模块
 */
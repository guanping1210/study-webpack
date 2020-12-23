
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin

module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, 'build')
  },
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
      // 第三方库的所有包，会单独打包成一个单独的js文件
      // 问题：如果包内容过大，需要划分为较小的单独的包，怎么做？
      // 解决：1、使用import()动态引入，能够自动分包
      chunks: 'all'
    }
  },
  // production 生产模式会自动压缩js代码
  mode: 'production',
}
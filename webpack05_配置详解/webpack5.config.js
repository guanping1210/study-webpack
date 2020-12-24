const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bunld.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new CleanWebpackPlugin()
  ],
  mode: 'development'
}

/**
 * webpack5 重点关注以下内容
 *  1、通过持久缓存提高构建性能
 *  2、使用更好的算法和默认值来改善长期缓存
 *  3、通过更好的树摇和代码生成来改善捆绑包大小
 *  4、清除处于怪异状态的内部结果，同时在v4中实现功能而不引入任何重大改变
 *  
 *  changelog: http://github.com/webpack/changelog-v5
 */
/**
 * 使用dll技术，对某些库(第三方库：jquery\react\vue)进行单独打包
 *  运行webpack时，默认是查找webpack.config.js配置文件
 *  需求：需要运行webpack.dll.js文件
 *    -->  webpack --config webpack.dll.js
 *  基本上只需要打包一次，
 */
const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: {
    // 最终打包生成的[name] --> jquery
    // ['jquery'] --> 要打包的库是jquery
    jquery: ['jquery'],
    react: ['react']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dll'),
    // 表示打包的库里面向外暴露出去的内容叫什么名字
    library: '[name]_[hash]'
  },
  plugins: [
    // 打包生成一个manifset.json文件，这个文件提供了与jquery的映射关系
    new webpack.DllPlugin({
      // 映射库的暴露的内容名称
      name: '[name]_[hash]',
      // 输出文件路径
      path: path.resolve(__dirname, 'dll/manifset.json')
    })
  ],
  mode: 'production'
}
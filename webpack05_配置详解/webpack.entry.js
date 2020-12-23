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
 * entry: 入口起点
 *  1、string --> './src/index.js'
 *    单入口
 *    所有资源打包形成一个chunk，输出一个bundle文件
 *    此时chunk的名称默认是 main
 *  2、array  --> ['./src/index.js', './src/add.js']
 *    多入口
 *    所有入口文件最终只会形成一个chunk,输出出去只有一个bundle文件.
 *      --> 只有在HMR功能中让html热更新生效，才会使用这中方式
 *  3、object --> { key: value }
 *    多入口
 *    有几个入口文件就形成几个chunk，输出几个bundle
 *    此时chunk的名称是 key 
 *      --> 特殊用法：适用于DLL
 *          {
 *              // index 与 count 打包到一起
 *              index: ['index.js', 'count.js'],
 *              add: 'add.js'
 *          }
 */
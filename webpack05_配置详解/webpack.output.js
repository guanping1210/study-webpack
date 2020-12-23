const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    // 文件名称(指定名称+目录 --> 'js/bundl.js') 
    filename: 'bunld.js',
    // 输出文件目录(将来素有资源输出的公共目录)
    path: path.resolve(__dirname, 'dist'),
    // 所有资源引入公共路径前缀 --> 'imgs/a.jpg' --> '/imgs/a.jpg'
    publicPath: '/',
    // 表示非入口chunk的名称
    //   1、通过import()语法引入的模块
    //   2、通过optimization.chunkSplit.chunk = 'all'分许出的chunk
    chunkFilename: '[name].chunk.js',
    // 表示全局整个库向外暴露的变量名
    library: '[name]',
    // 表示将对外暴露的变量名添加到那个环境上, 外面可以使用(通常配合DLL使用)
    // window |  global | commonjs | amdjs
    librryTarget: 'window'
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new CleanWebpackPlugin()
  ],
  mode: 'development'
}

/**
 * output: 入口起点
 *  1、string --> './src/index.js'
 */
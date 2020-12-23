const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bunld.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-laoder', 'css-loader']
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new CleanWebpackPlugin()
  ],
  //  解析模块的规则
  resolve: {
    // 配置解析模块的路径别名: 优点简写路径，缺点路径没有提示了
    alias: {
      $css: path.resolve(__dirname, 'src/css')
    },
    // 配置省略文件路径的后缀名
    extensions: ['.js', '.json', '.jsx'],
    // 告诉 webpack 解析模块的时候去找哪个目录
    // 如果不是绝对路径，那么会默认从当前文件夹依次往上找
    modules: [
      path.resolve(__dirname, '../../node_modules'),
      'node_modules'
    ]
  },
  mode: 'development'
}
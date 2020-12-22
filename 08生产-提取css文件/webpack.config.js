const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// 这个插件能够单独提取css成为单独的文件
const MiniCssExtraPlugin = require('mini-css-extract-plugin')

module.exports = {
  entry: './js/index.js',
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          // 创建style标签，将样式放入
          // 'style-loader',

          // 单独提取css为单独文件，用MiniCssExtraPlugin.loader取代style-loader
          MiniCssExtraPlugin.loader,
          // 将css文件整合到js文件中
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    new MiniCssExtraPlugin({
      // 对输出的文件重命名，默认是main.css
      filename: 'css/built.css',
    })
  ],
  devServer: {
    contentBase: path.resolve(__dirname, '/dist'),
    port: 3000,
    open: true,
  }
}
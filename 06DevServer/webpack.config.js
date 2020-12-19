const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      },
      // 打印其他资源(除开html/js/css)，例如字体资源
      // file-loader 用来打包其他资源
      {
        // 排除匹配到的资源
        exclude: /\.(css|js|html)$/,
        loader: 'file-loader',
        options: {
          name: '[hash:10].[ext]'
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  mode: 'development',
  // 开发服务器devServer: 用来自动化（自动编译，自动打开浏览器，自动刷新浏览器）
  // 特点：只会在内存中编译打包，不会有任务输出
  // 启动devServer指令为：webpack-dev-server
  devServer: {
    // 表示要运行的目录，是构建后的目录
    contentBase: path.resolve(__dirname, 'dist'),
    // 启动gzip压缩
    compress: true,
    // 服务端口号
    port: 3000,
    // 自动打开浏览器
    open: true,
  }
}
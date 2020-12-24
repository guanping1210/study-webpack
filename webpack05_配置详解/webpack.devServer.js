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
  mode: 'development',
  // devServer --> 一定是开发环境
  devServer: {
    // 运行代码的目录
    contentBase: path.resolve(__dirname, 'dist'),
    // 监视contentBase目录下的所有文件，一旦文件变化，就会reload重载
    watchContentBase: true,
    // 监视的其他配置
    watchOptions: {
      // 忽略文件
      ignored: /node_modules/
    },
    // 启动gzip压缩
    compress: true,
    // 端口号
    port: 5000,
    // 域名
    host: 'localhost',
    // 自动打开浏览器
    open: true,
    // 开启HMR功能
    hot: true,
    // 不要显示启动服务器的日志信息
    clientLogLevel: 'none',
    // 除了一些基本启动信息之外，其他内容都不要显示
    quiet: true,
    // 如果出错了，不要全屏提示~
    overlay: false,
    // 服务器代理 --> 解决开发环境跨域问题
    proxy: {
      // 一旦devServer(5000端口)服务器接收到/api/xxx的请求，
      // 就会把请求转发到另外一个服务器(3000)
      '/api': {
        target: 'http://localhost:3000',
        // 发送请求是，请求路径重写，将 /api/xxx --> /xxx (去掉/api)
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}

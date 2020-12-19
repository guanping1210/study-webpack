/**
 * 开发环境配置：能让代码运行
 * 运行项目指令：
 *   webpack 会将打包结果输出出去
 *   npx webpack-dev-server 只会在内存中编译打包，不会输出
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  mode: 'development',
  module: {
    rules: [
      {
        // 处理less资源
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
      {
        // 处理css资源
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        // 处理图片资源
        test: /\.(jpg|jpeg|svg|gif|png)$/,
        loader: 'url-loader',
        options: {
          limit: 8 * 1024,
          name: '[name:8].[ext]',
          // 关闭es6模块化
          exModule: false,
          // 指定输出的文件目录
          outputPath: 'imgs'
        }
      },
      {
        // 处理html中的图片资源
        // 处理图片资源
        test: /\.html$/,
        use: ['html-loader'],
      },
      {
        // 处理其他资源
        exclude: /\.(html|js|css|less|jpg|png|jpeg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[hash:10].[ext]',
          outputPath: 'asset'
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

// 启动服务：npx webpack-dev-server
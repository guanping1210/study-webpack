const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// 这个插件能够单独提取css成为单独的文件
const MiniCssExtraPlugin = require('mini-css-extract-plugin')

// 设置nodejs环境变量
process.env.NODE_ENV = 'development'

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
          'css-loader',
          /**
           * css兼容性处理：
           * postcss -> postcss-loader、postcss-preset-env
           * 
           * postcss-preset-env: 帮postcss找到package.json中browserslist里面的配置，
           * 通过配置加载指定的css兼容性配置
           * 
           * "browserslist": {
           *    开发环境 --> 设置node环境变量：provcess.env.NODE_ENV = 'devlopmenet'
                "development": [
                "last 1 chrome version",
                "last 1 firefox version",
                "last 1 safair version"
              ],
              生产环境：默认是看生产环境
                "production": [
                  ">0.2%",
                  "not dead",
                  "not op_mini all"
                ]
              }
           * 
           */
          // 1、使用loader的默认配置
          // 'postcss-loader'

          // 2、修改loader的配置
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                // postcss插件
                require('postcss-preset-env')()
              ]
            }
          }
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
      filename: 'css/built.css'
    })
  ],
  devServer: {
    contentBase: path.resolve(__dirname, '/dist'),
    port: 3000,
    open: true,
  }
}
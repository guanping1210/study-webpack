const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [
      /**
       * JS 兼容性处理：babel-loader @babel-preset-env
       *              babel  @babel/core
       *  1、基本JS处理 --> @babel/preset-env
       *     问题：只能转换基本语法，如const、箭头函数等，不能转换Promise等高级语法
       *  2、全部JS兼容性处理 --> @babel/pollyfill (引入即可)
       *     问题：我只要解决部分兼容性问题，但是将所有兼容性代码全部引入，导致代码体积过大
       *  3、针对需要做兼容性的处理才做：按需加载  --> core-js
       * 
       *  注意：方案2/3，不可同时使用
       */
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          // 预设：指示babel做怎么样的兼容性梳理
          presets: [
            [
              '@babel/preset-env',
              {
                // 按需加载
                useBuiltIns: 'usage',
                // 指定core-js版本
                corejs: {
                  version: 3
                },
                // 指定兼容性做到哪个版本浏览器
                targets: {
                  chrome: '60',
                  firefox: '60',
                  ie: '9',
                  safari: '10',
                  edge: '17'
                }
              }
            ]
          ]
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  mode: 'development'
}
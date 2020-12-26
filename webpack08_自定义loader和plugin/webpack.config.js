const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

// 自定义plugin
const Plugin1 = require('./plugins/Plugin1') 


module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bunld.js',
    path: path.resolve(__dirname, 'dist')
  },
  // 自定义loader测试
  module: {
    rules: [
      {
        test: /\.js$/,
        // loader: 'loader1',
        /**
         * 会顺序执行每个loader的pitch方法，再倒叙执行loader的具体内容
         * pitch打印顺序： 1 -> 2 -> 3
         * loader打印顺序：3 -> 2 -> 1
         */
        use: [
          'loader1',
          'loader2',
          // 'loader3'
          // loader会接收options配置
          {
            loader: 'loader3',
            options: {
              // schema文件对name属性定义的是string类型
              // 如果这儿输入其他类型，则会报错(目前测试并没有报错)
              name: 'jack',
              // 规则中只定义了name，如果没有additionalProperities=true，追加其他属性会报错
              // 亲测additionalProperities=false，并没有报错，没有这个属性的时候才会报错
              age: 19
            }
          },
        ]
      },
      // 自定义babelLoader
      {
        test: /\.js$/,
        loader: 'babelLoader',
        options: {
          // 预设值
          presets: [
            '@babel/preset-env'
          ]
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new CleanWebpackPlugin(),
    // 测试自定义plugin
    new Plugin1()
  ],
  // 配置解析loader的规则，默认情况下是node_modules
  // 可以自己添加查找的路径
  resolveLoader: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'loaders')
    ]
  },
  mode: 'development'
}

/**
 * loader, 本质上是个函数
 */

/**
 * plugin, 本质上是个类
 */

/**
 * complier继承自tapable
 */
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
       * 语法检查：eslint-loader eslint
       * 只检查自己写的源代码，第三方库是不检查的
       * 设置检查规则：
       *  package.json中的eslintConfig中设置
       *  airbnb规则：eslint-config-airbnb-base
       *             eslint
       *             eslint-plugin-import
       *  问题：亲测airbnb并没有产生作用
       */
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          // 自动修复
          fix: true,
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  devtool: 'source-map',
  mode: 'development'
}
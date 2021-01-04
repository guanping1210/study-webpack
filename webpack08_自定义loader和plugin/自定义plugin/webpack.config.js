const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const Plugin1 = require('./lib/plugin1')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new HtmlWebpackPlugin({
          template: './src/index.html',
        }),
        new CleanWebpackPlugin(),
        // 自定义plugin
        new Plugin1()
      ],
    mode: 'development'
}
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// 这个插件能够单独提取css成为单独的文件
const MiniCssExtraPlugin = require('mini-css-extract-plugin')
// optimize-css-assets-webpack-plugin 用来压缩css
const OptimizeCssAssetsWebpaclPlugin = require('optimize-css-assets-webpack-plugin')

// 设置nodejs环境变量
// process.env.NODE_ENV = 'development'

module.exports = {
  entry: './js/index.js',
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  mode: 'production',
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

          {
            loader: 'postcss-loader',
            // 碰到有兼容性问题，在options下面直接写plugins会有兼容性问题
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'postcss-preset-env',
                    {
                      ident: 'postcss'
                    }
                  ]
                ]
              }
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
    }),
    // 压缩css
    // new OptimizeCssAssetsWebpaclPlugin()
  ],
  devServer: {
    contentBase: path.resolve(__dirname, '/dist'),
    port: 3000,
    open: true,
  }
}
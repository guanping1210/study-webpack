const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bunld.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      /**
       * loader配置
       */
      {
        test: /\.css$/,
        // 多个loader
        use: ['style-laoder', 'css-loader']
      },
      {
        test: /\.js$/,
        // 排除mode_modules下的js文件
        exclude: /node_modules/,
        // 表示只检查src下的js文件
        include: path.resolve(__dirname, 'src'),
        // 执行顺序：pre 优先执行 ｜ post 延后执行 | 默认是中间执行
        enforce: 'pre',
        // 单个loader
        loader: 'eslint-loader',
        // 单个loader可以配置options，设置loader的一些属性
        options: {

        }
      },
      {
        // 以下配置只会生效一个
        oneOf: []
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new CleanWebpackPlugin()
  ],
  mode: 'development'
}
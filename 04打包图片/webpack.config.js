const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[chunkhash:6].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    // chunkFilename: '[name].[hash:4].js'
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      },
      {
        // 缺点：处理不了html文件中的图片
        test: /\.(png|jpeg)$/,
        // 只使用一个loader，可以直接使用loader，不需要使用use
        // 需要下载url-loader file-loader, 因为url-loader是依赖file-loader的
        // url-loader内部是包含有file-loader模块的
        // use: ['file-loader']
        loader: 'url-loader',
        options: {
          // 图片大小小于8KB，就会被base64处理
          // 优点：减少请求数量（减轻服务器压力）
          // 缺点：图片体积会更大（文件请求速度更慢）
          limit: 8 * 1024,
          //问题：处理html中的图片会失败，因为url-loader默认使用ES6模块化解析的
          // 而html-loader是使用commonjs模块解析的
          // 解决：关闭url-loader的es6模块化，改用commonjs解析,
          esModule: false,
          // 给图片进行重命名
          // [hash:10] 取图片的hash的钱10位
          // [ext] 取文件原来的扩展名
          name: '[hash:10].[ext]'
        }
      },
      {
        // 处理html中的图片资源
        test: /\.html$/,
        // 专门处理html中的img图片（负责引入img,从而能被url-loader处理）
        loader: 'html-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
  ],
  mode: 'development'
}
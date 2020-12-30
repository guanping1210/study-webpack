const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// 这个库在webpack v4.26 之后，用来代替uglify 实现代码压缩功能
const TerserWebpackPlugin = require('terser-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[contenthash:10].bunld.js',
    path: path.resolve(__dirname, 'dist'),
    chunkFilename: '[name]_chunk.js'
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new CleanWebpackPlugin()
  ],
  mode: 'development',
  optimization: {
    // 代码分割
    splitChunks: {
      chunk: 'all',
      // 分割的chunk最小为30KB 
      minSize: 30 * 1024,
      // 0 表示最大没有限制
      maxSize: 0,
      // 要提取的chunk最少被引用一次
      minChunks: 1,
      // 按需加载时并行加载的文件的最大数量
      maxAsyncRequests: 5,
      // 入口js文件最大并行请求数量
      maxInitialRequest: 3,
      // 名称链接符号
      automaticNameDeli: '~',
      // 可以使用命名规则
      name: true,
      // 分割chunk的组
      cacheGroups: {
        // 表示node_modules文件会被打包到vendors组的chunk中 --> vendors~xxx.js
        // 满足上面的公共规则， 如：大小超过30KB，至少被引用一次
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          // 打包的优先级
          priority: -10
        },
        // 默认组
        default: {
          // 要提取的chunk最少被引用2次
          minChunks: 2,
          // 优先级
          priority: -20,
          // 如果当前要打包的模块，和之前已经被提取的模块是同一个，就会复用，而不是重新打包模块
          reuseExistingChunk: true
        }
      }
    },
    // 将当前模块的记录其他模块的hash值单独打包为一个runtime文件
    // 也就是每次重新打包，只会更新当前的模块文件以及runtime文件，其余文件不会更新
    // 解决：修改a文件，导致b文件的contenthash变化
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint}`
    },
    // 配置生产环境的压缩方案：js和css
    minimizer: [
      new TerserWebpackPlugin({
        // 开启缓存
        cache: true,
        // 开启多进程打包
        parallel: true,
        // 启动source-map
        sourceMap: true,
      })
    ]
  }
}

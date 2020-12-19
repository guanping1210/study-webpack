/**
 * webpack 配置文件
 * 作用：指示webpack干哪些活儿（当你运行webpack指令时，会加载里面的配置）
 * 
 * 目前所有的构建工具都是基于nodejs平台运行的，模块化默认采用commonjs
 * 
 * 
 */
const path = require('path')
const { resolve } = path

  //  webpack配置
 module.exports = {
  //  入口起点
  entry: './src/index.js',
  // 输出
  output: {
    filename: 'bundle.js', // 输出文件名
    // 输出路径
    // __dirname nodejs的变量，代表当前文件的目录的绝对路径
    path: resolve(__dirname, 'build'), 
  },
  // loader配置
  module: {
    // 详细的loader配置
    rules: [
      {
        // test 正则表达式，表示匹配哪些文件
        test: /\.css$/,
        // 使用哪些loader
        // use数组中的loader执行顺序：从右到左，从上到下，依次执行
        use: [
          // 创建style标签，将js中的样式资源插入到html文件中的head中生效
          'style-loader',
          // 将css文件以字符串形式变为commonjs模块加载到js中
          // 里面内容是样式字符串
          'css-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          // 将less文件编译为css文件
          // 需要两个包：less-loader和less
          'less-loader'
        ]
      }
    ]
  },
  // plugins的配置
  plugins: [
    // 详细的plugins的配置
  ],
  // 模式
  mode: 'development'
 }
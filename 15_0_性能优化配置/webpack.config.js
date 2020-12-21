/**
 * 开发环境配置：能让代码运行
 * 运行项目指令：
 *   webpack 会将打包结果输出出去
 *   npx webpack-dev-server 只会在内存中编译打包，不会输出
 * 
 * 1、HMR：hot module replacement 模块热更新（模块局部更新，不刷新页面）
 *    作用：一个模块发生变化，只会重新打包这一个模块，而不是打包所有
 *       能够极大的提升代码的构建速度
 * 
 *       样式文件：可以使用HMR功能：因为style-loader内部实现了
 *       js文件：默认是没有HMR功能的 --> 需要修改js代码，添加支持HMR功能的代码
 *         注意：HMR功能对JS的处理，只能处理非入口js文件的其他文件
 *       html文件：默认是没有HMR功能的，同时会导致问题：html文件不能热更新(不需要对html文件做HRM)
 *         解决：修改entry文件，将html文件引入
 * 
 * 2、source-map: 一种提供源代码到构建后代码的映射技术(如果构建后的代码出错了，通过映射关系，可以追踪到源码带错误)
 *    具体可配置的值：
 *      source-map: 外部（提示错误代码的准确信息和源代码的错误位置）
 *      inline-source-map: 内联（只生成一个内联source-map + 提示错误代码的准确信息和源代码的错误位置）
 *      hidden-source-map: 外部 (提示到错误代码的错误原因，但是没有错误位置，不能追踪到源码上的错误位置，只能提示到构建后代码的错误位置)
 *      eval-source-map: 内联（每个文件都生成对应的source-map，都在eval函数中；提示错误原因+源码的错误位置）
 *      nosources-source-map: 外部 (能够找到错误代码的准确信息，但是没有任何源代码的信息)
 *      cheap-source-map: 外部 (错误代码准备信息和源码的错误位置，但是只能精确到行，而不能精确到列)
 *      cheap-module-source-map: 外部 (精确提示到源码行，module会将loader的source-map加入进来)
 *      
 *      内联和外部的区别: 1、外部生成了文件，内联没有  2、内联构建速度更快
 *   
 *    使用要求：
 *      开发环境：速度快、调试更友好
 *        速度快: eval > inline > cheap
 *        调试友好: source-map > cheap-module-source-map > cheap-source-map
 *   
 *        -- 最终结论：eval-source-map / eval-cheap-module-source-map  
 * 
 *      生产环境：源码需不需要隐藏？调试要不要更友好
 *        内联会让代码体积变大，所以生产环境不使用内联，只使用外部文件的模式
 *        noresouce-source-map 全部隐藏
 *        hidden-source-map 只隐藏源代码，会提示构建后代码错误信息       
 * 
 *        --> source-map / cheap-module-source-map
 *  
 *    速度比较：
 *      eval-source-map 是最快的，其次是inline-source-map, 再其次是cheap这些
 * 
 * 
 */
var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin

module.exports = {
  entry: [
    './src/js/index.js',
    './src/index.html'
  ],
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  mode: 'development',
  module: {
    rules: [
      {
        /**
         * oneOf内部，对每种文件只能编写一个规则，重复文件类型处理会报错
         */
        onfOf: [
          {
            test: '/\.js$/',
            loader: 'eslint-loader',
            options: {
              fix: true
            }
          }
        ]
      },
      {
        // 处理less资源
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
      {
        // 处理css资源
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        // 处理图片资源
        test: /\.(jpg|jpeg|svg|gif|png)$/,
        loader: 'url-loader',
        options: {
          limit: 8 * 1024,
          name: '[name:8].[ext]',
          // 关闭es6模块化
          exModule: false,
          // 指定输出的文件目录
          outputPath: 'imgs'
        }
      },
      {
        // 处理html中的图片资源
        // 处理图片资源
        test: /\.html$/,
        use: ['html-loader'],
      },
      {
        // 处理其他资源
        exclude: /\.(html|js|css|less|jpg|png|jpeg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[hash:10].[ext]',
          outputPath: 'asset'
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  // 开发服务器devServer: 用来自动化（自动编译，自动打开浏览器，自动刷新浏览器）
  // 特点：只会在内存中编译打包，不会有任务输出
  // 启动devServer指令为：webpack-dev-server
  devServer: {
    // 表示要运行的目录，是构建后的目录
    contentBase: path.resolve(__dirname, 'dist'),
    // 启动gzip压缩
    compress: true,
    // 服务端口号
    port: 3000,
    // 自动打开浏览器
    open: true,
    // 开启HMR功能
    // 当修改了webpack配置，想要配置生效，必须重启webpack服务，才能有效
    hot: true
  },
  // source
  devtool: 'source-map'
}

// 启动服务：npx webpack-dev-server
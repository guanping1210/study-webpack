/**
 * 
 * 生产环境的优化配置: 构建打包速度、压缩代码、缓存、tree-shaking
 * 1、oneOf：表示每个文件只能匹配一个loader，被一个loader处理，可以用来提高loader的执行效率
 *     本来按照书写的顺序，每种文件会被rules里面的配置全部扫描一遍，再对应执行相应的loader；
 *     但是使用oneOf，能够让每个文件只匹配一个loader， 就不需要再遍历下面的loader了
 *    注意：不能有两个配置处理同一类型文件
 * 
 * 2、缓存
 *     babel缓存：cacheDirectory， 也就是第一次babel编译之后，第二次构建时，会读取之前编译的缓存
 *          --> 第二次打包构建速度更快
 *     文件资源缓存：改变文件资源名儿 --> hash | chunkhash | contenthash
 *          默认是开启的disck磁盘缓存，也就是强缓存。但是导致的问题就是，
 *          当资源编译改变后，读取的内容依然是磁盘缓存，没有改变
 *          解决方案：给output文件，都加上hash值。那么当源码修改后，编译的hash值会变化。
 *                          如果hash变化了，那么会读取最新的hash文件
 *        hash: 每次webpack构建时都会生成一个唯一的hash值,不管内容变不变，只要重新打包，hash值就会改变
 *            问题: 因为js和css同时使用一个hash值，如果重新打包会导致所有缓存失效（可能只改动了一个文件）
 *        chunkhash:  根据chunk生成的hash值。如果打包来源于同一个chunk，那么hash值是一样的
 *            问题: js和css的hash值还是一样的(因为css是在js中引入的，所以同属于同一个chunk,所以hash值是一样的, 如果把css单独提取出来，查看一下hash是否一致 )
 *            --> 经过验证：不管css是否单独提取，其hash都与入口hash是一致的。改动css，依然会导致所有的缓存都失效
 *        contenthash: 根据文件的内容生成hash值，不同文件的hash值是一定不一样的
 *            -->  让代码上线运行缓存更好使用
 * 
 * 3、tree-shaking: 树摇，就是为了去除掉代码中没有使用的代码,去除无用的代码(JS\CSS)
 *    前提: 1、必须使用ES6模块化 2、开发是production环境
 *    作用: 减少代码体积
 * 
 *    在package.json中配置 "sideEffects": false, 表示所有代码都没有副作用，都可以进行tree shaking
 *        问题：可能会把js中引入的css/@babel/polyfill(副作用)文件干掉
 *        解决方案: 把不需要进行tree shaking的文件配置到sideEffects中
 *        "sideEffects": ['*.css', '*.less']
 * 
 * 4、code split: 代码分割，主要是将一个chunk，分割为不同的小chunk, 更能实现按需加载
 *      optimization: 
 *          1、可以将node_modules中的所有代码单独打包给一个chunk最终输出，与自己写的源码打包分开(单入口只能做这一件事儿，但是自己的文件区分不出来)
 *          2、会自动分析多入口chunk中，有没有公共的文件。如果有，会打包成一个单独的chunk
 *          3、通过动态引入js模块加载，让某个文件被单独打包为一个chunk(但是好像只针对用户自己写的模块文件)
 * 
 * 5、懒加载：当使用到的时候才加载文件，并不会提前加载资源文件
 *     import(/* webpackChunkName: 文件重命名 * / 文件路径) --> 多次调用不会重复加载，只会加载一次，其余读取缓存
 * 
 * 6、预加载：提前加载文件资源，读取的时候是读取缓存，所以速度快
 *     import(/* webpackChunkName: 文件重命名, webpackPrefetch: true * / 文件路径) --> 多次调用不会重复加载，只会加载一次，其余读取缓存
 * 
 *    懒加载与预加载的区别：
 *      懒加载：1、正常加载，可以认为是并行加载（同一时间加载多个文件）
 *             2、加载的资源没有顺序，并不是说按照先后使用顺序去加载的
 *             3、可能加载的文件多，会有一点儿阻塞
 *      预加载：1、等其他资源加载完毕，浏览器空闲了再偷偷加载资源(比较合理)
 *             2、不会造成资源阻塞
 *             3、兼容性问题比较大，适用于PC，目前不适用于移动端
 * 
 * 7、PWA(渐进式网络开发应用程序｜离线可访问)：serviceWorker + cache(淘宝、掘金...)
 *      作用：即使关闭网络，应用也可以正常访问，也就是所谓的离线应用
 *      workbox --> workbox-webpack-plugin
 *        1、帮助我们快速生成service-worker的配置文件
 *        2、我们需要手动在入口文件去注册serviceWorker
 *        3、注册的时候需要判断兼容性
 *        4、serviceworker代码需要在服务器下才能运行
 *        5、需要注意全局变量的配置，在package.json中的eslintConfig配置支持的全局变量
 * 
 * 8、多进程打包：thread-loader(开启多个进程同时打包，但是每个进程启动时间都需要600ms左右，所以需要慎用)
 * 
 * 9、externals：决定哪些包是不需要打包的，可以改为CDN引入，被external指定的包，是需要手动在html页面中引入CDN链接
 *     实现：wepack支持externals配置,包含的这些命名的库，就不会被打包进去
 *          { jquery: 'jquery' }
 * 
 * 10、dll: 动态打包库，将node_modules中的东西，打包为独立的小chunk,能够对代码单独打包
 *      实现有些复杂：1、单独提取一个dll配置文件
 *                   2、定义dll打包的入口和输出
 *                   3、使用 webpack.DllPlugin 插件配置, 能够指定单独打包的库名和存放位置
 *                   4、需要指定一个manifset.json文件，来表示打包的库与引用的库直接的映射关系
 * 
 */

var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin
var MiniCssExtraPlugin = require('mini-css-extract-plugin')
var OptimizeCssAssetPlugin = require('optimize-css-assets-webpack-plugin')
var DefinePlugin = require('webpack').DefinePlugin

// 定义nodejs环境变量：来决定使用browserslist的哪个环境
process.env.NODE_ENV = 'production'

// 复用loader
var commonCssLoader = [
  MiniCssExtraPlugin.loader,
          'css-loader',
          {
            // 需要在package中定义兼容哪些浏览器
            // browserslist
            loader: 'postcss-loader',
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

module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'js/bundle.[contenthash:10].js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: commonCssLoader,
      },
      {
        // less也需要兼容性处理，但是处理的步骤是在编译为css之后，注入css之前
        test: /\.less$/,
        use: [
          ...commonCssLoader,
          'less-loader'
        ]
      },
      /**
       * 正常来讲，一个文件只能被一个loader处理
       * 当一个文件需要多个loader处理，那么一定要指定loader执行的先后顺序
       *  先执行eslint，再执行babel
       */
      {
        // package.json中添加eslintConfig指示做哪些检查 --> airbnb
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        // 表示优先执行
        enforce: 'pre',
        options: {
          fix: true
        }
      }, 
      {
        /**
         * js 兼容性处理
         */
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                useBuiltIns: 'usage',
                corejs: {
                  version: '3',
                },
                targets: {
                  chrome: '60',
                  firefox: '60',
                  ie: '9',
                  safari: '10',
                  edge: '17'
                }
              }
            ]
          ],
          // 开启babel缓存
          // 第二次构建时，会读取之前的缓存
          cacheDirectory: true,
        }
      },
      // 处理图片
      {
        test: /\.(jpg|svg|gif|jepg|png)$/,
        loader: 'url-loader',
        options: {
          limit: 8 * 1024,
          name: '[hash:10].[ext]',
          outputPath: 'imgs',
          esModule: false,
        }
      },
      // 检测html文件中的图片问题
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      //  其他文件
      { 
        exclude: /.(html|js|jpg|png|svg|less|css|gif)$/,
        loader: 'file-loader',
        options: {
          outputPath: 'assets',
          name: '[has:10].[ext]'
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      // html压缩
      minify: {
        // 移除空格
        collapseWhitespace: true,
        // 移除注释
        removeComments: true
      }
    }),
    // 将css提取问单独的文件
    new MiniCssExtraPlugin({
      name: 'css/build.[contenthash:10].css'
    }),
    // 压缩css代码
    new OptimizeCssAssetPlugin(),
  ],
  // production 生产模式会自动压缩js代码
  mode: 'production'
}
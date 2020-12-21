/**
 * 开发环境的优化配置: 构建打包速度、压缩代码、缓存
 * 1、oneOf：表示每个文件只能匹配一个loader，被一个loader处理，可以用来提高loader的执行效率
 *     本来按照书写的顺序，每种文件会被rules里面的配置全部扫描一遍，再对应执行相应的loader；
 *     但是使用oneOf，能够让每个文件只匹配一个loader， 就不需要再遍历下面的loader了
 *    注意：不能有两个配置处理同一类型文件
 * 
 * 2、缓存
 *     babel缓存：cacheDirectory, 也就是第一次编译后，
 *     文件资源缓存：
 */

var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin
var MiniCssExtraPlugin = require('mini-css-extract-plugin')
var OptimizeCssAssetPlugin = require('optimize-css-assets-webpack-plugin')
// var DefinePlugin = require('webpack').DefinePlugin

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
      filename: 'css/build.[contenthash:10].css'
    }),
    // 压缩css代码
    new OptimizeCssAssetPlugin(),
  ],
  // production 生产模式会自动压缩js代码
  mode: 'production',
  devtool: 'source-map'
}
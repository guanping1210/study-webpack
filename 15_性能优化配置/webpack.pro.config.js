const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtraPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetPlugin = require('optimize-css-assets-webpack-plugin')

// 定义nodejs环境变量：来决定使用browserslist的哪个环境
process.env.NODE_ENV = 'production'

// 复用loader
const commonCssLoader = [
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
    filename: 'js/bundle.js',
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
          preset: [
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
          ]
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
      name: 'css/build.css'
    }),
    // 压缩css代码
    new OptimizeCssAssetPlugin(),
  ],
  // production 生产模式会自动压缩js代码
  mode: 'production'
}
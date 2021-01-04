const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    // 自定义loader测试
    module: {
        rules: [
            {
                test: /\.js/,
                use: [
                    // 同步loader
                    'loader1', 
                    // 异步loader
                    'loader2',
                    // 自定义配置loader
                    {
                        loader: 'loader3',
                        options: {
                            name: 'jack'
                        }
                    },
                ]
            },
            // 实战：babel-loader
            {
                test: /\.js$/,
                loader: 'babelLoader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
          template: './src/index.html',
        }),
        new CleanWebpackPlugin(),
      ],
    // 配置解析loader的规则，默认情况下是node_modules
    // 可以自己添加查找的路径
    resolveLoader: {
    modules: [
        'node_modules',
        path.resolve(__dirname, 'lib'), // 自定义loader查找的路径
    ]
    },
    mode: 'development'
}
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                useBuiltIns: 'usage',
                                corejs: {
                                    version: '3'
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
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
        })
    ],
    mode: 'production'
}

/**
 * 亲测babel缓存 - cacheDirectory打包，js文件里面只写了一个Promise.resolve
 * 第一次打包耗时 1678ms, 第二次打包 977ms， 第三次 971ms
 * 由此可见：
 *     配置cacheDirectory=true之后， 第一次Babel对js进行编译，
 *     之后的几次，直接读取第一次babel编译的缓存。
 *     编译打包速度基本上能提升一倍，时间减少一半儿
 */
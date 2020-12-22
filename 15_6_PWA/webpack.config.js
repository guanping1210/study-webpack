const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// 这个插件可以用来开发PWA
const WorkboxWebpackPlugin = require('workbox-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'js/[name].[contenthash:8].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
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
                                    // 设置了提取单独css文件的时候会报错
                                    // ie与提取css文件插件之间好像有点儿问题
                                    // ie: '10',
                                    safari: '10',
                                    edge: '17'
                                }
                            }
                        ]
                    ]
                }
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        // 开启PWA
        new WorkboxWebpackPlugin.GenerateSW({
            /**
             * 1、帮助serviceworker快速启动
             * 2、删除旧的serviceworker
             * 
             * 能够帮我们生成一个service-worker的配置文件，快速注册一个serviceworker
             */
            clientsClaim: true,
            skipWaiting: true
        })
    ],
    optimization: {
      usedExports: true, // 开发模式开启tree-shaking
    },
    // mode: 'production'
    mode: 'development',
}

/**
 * PWA: workbox-webpack-plugin 用这个插件能快速实现
 * 
 * 亲测：能快速生成service-worker配置文件
 * 
 * 亲测：online与offline，都能够正常访问网页
 */
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
                use: [
                    /**
                     * 开启多进程打包
                     *   进程开启是有时间的大概为600ms, 进程通信也有时间开销
                     *   只有工作消耗时间比较唱，才需要多进程打包
                     */
                    // 'thread-loader',
                    {
                        loader: 'thread-laoder',
                        options: {
                            workers: 2 //  开启两个进程
                        }
                    },
                    { 
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
                    }
                ]
                
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
 * 多进程打包： thread-loader, 能够提供多进程打包
 *            也可以配置开启的进程数量
 * 
 * 亲测：
 *      资源代码少时，开启多进程打包，耗时2324ms
 *      不开启时耗时1789ms
 */
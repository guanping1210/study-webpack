const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'js/[hash:6].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    // 用MiniCssExtractPlugin来替代style-loader,将css提取为单独的文件，看hash值是否会一致
                    MiniCssExtractPlugin.loader,
                    // 'style-loader',
                    'css-loader',
                ]
            },
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
        }),
        // 测试将css提取为单独的文件，看hash值是否与入口的hash相等
        new MiniCssExtractPlugin({
            filename: 'css/[hash:6].css'
        })
    ],
    mode: 'production',
    // 有单独提取css文件的时候，最好不要使用source-map
    // devtool: 'source-map'
}

/**
 * hash缓存(采用的memory cache)：每次webpack处理后都会生成唯一的hash值，文件有改动，重新打包后hash会更改
 *  好处：如果文件资源没有更新，那么访问速度会很快，因为读取的是缓存的资源
 *  问题： 如果css代码是通过style-loader打包到js文件中，那么css和js的hash，是属于同一个入口hash的，
 *         也就是说，不管是修改css或者js，会导致入口文件的hash更新，也就是资源整体更新。
 *         当入口文件比较大的时候，反而会降低更新速度
 *  解决方案：1、将css单独提取为文件(亲测，就算把css单独提取，其hash值也和js的hash是一致的。，所以并不能解决改动一部分就导致缓存全部失效的问题)
 *           2、将资源代码打包为chunk，而不是一个整体包
 * 
 * 注意：devtool="source-map" + mini-css-extract-plugin三者同时使用打包css会打包错误
 *  原因猜测：可能是css单独提取，不好找source-map之间的映射关系
 * 
 */

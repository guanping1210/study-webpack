const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// 只是将css文件单独提取出来，但是是根据入口打包为同一个的文件，没有更细致的区分
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// 这个插件，能将css文件分为更小的chunk，一个css文件就对应一个chunk，而不是根据入口来划分数量的
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin')

module.exports = {
    entry: {
        main: './src/index.js',
        test: './src/test.js',
    },
    output: {
        filename: 'js/[name].[contenthash:8].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    // 'style-loader',
                    MiniCssExtractPlugin.loader,
                    'css-loader'
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
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[contenthash:8].bundle.css'
        }),
    ],
    mode: 'production',
}

/**
 * contenthash: 根据文件内容生成的hash，只要文件内容不变，其hash值就不会改变。不同文件的hash值一定是不相同的
 *    css和js文件的hash值都不相同了。所以，修改某个文件，就只会导致一个文件的更新，而不会导致所有的都更新
 * 
 * 完美的解决了之前hash\chunkhash所导致的问题，能够让代码上线运行缓存更好使用
 * 
 */

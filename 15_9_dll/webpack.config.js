const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')
// 
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin')

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
        // 告诉webpack，哪些库不参与打包，同时使用时的名称也得改
        new webpack.DllReferencePlugin({
            manifest: path.resolve(__dirname, 'dll/manifset.json'),
            name: 'test.js'
        }),
        // 将某个文件打包并输出去，并在html中自动引入该文件
        new AddAssetHtmlWebpackPlugin({
            filepath: path.resolve(__dirname, 'dll/jquery.js')
        })
    ],
    optimization: {
      usedExports: true, // 开发模式开启tree-shaking
    },
    // mode: 'production'
    mode: 'development',
    // 打包时需要忽略的东西
    externals: {
        // 配置忽略的库名 -- npm包名
        // 拒绝jquery包被打包进来，但是就需要在html中引入CDN连接
        jquery: 'jQuery'
    }
}

/**
 * DLL：
 */
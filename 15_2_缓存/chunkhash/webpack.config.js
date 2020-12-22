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
        filename: 'js/[name].[chunkhash:8].bundle.js',
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
            filename: 'css/[chunkhash:8].bundle.css'
        }),
    ],
    mode: 'production',
}

/**
 * 理解module, chunk, bundle三者之间的关系：
 *  同一份逻辑代码在不同场景下对应的名字
 *  module: 用户直接写的模块，叫module
 *  chunk: webpack处理时的资源，叫chunk(其实也就是每个模块会被打包为一个chunk,而不是之间全部打包到一个文件中)
 *  bundle: 最后生成浏览器可以直接运行的资源，叫bundle 
 * 
 * chunkhash: 根据不同的入口文件解析，构建对应的chunk, 生成的对应的hash值
 *  问题1：如果css内容等直接打包到js中，那么不论修改什么，整体缓存都会重新刷洗
 *  解决1：将css单独打包，提取为单独的文件(但是测试之后发现，由于css是在js中引入的，所以hash值还是一样的，还是会导致所有都刷新)
 *  --> 留着给contenthash解决
 * 
 * 细节注意：设置js兼容的时候，只要设置了ie，打包就会报错(暂时还未查到原因)
 * 
 * 另一个插件： extract-text-webpack-plugin, 能够按照模块提取css文件，也就是一个css文件就提取为一个
 * 
 * 多入口的话，每个入口都会打包有一份css文件，这个css文件包含全部的css
 * 
 */

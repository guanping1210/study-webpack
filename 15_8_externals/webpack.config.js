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
 * externals: 指定哪些包是不需要被编译的,不参与打包的库，需要通过CDN在html中手动引入
 * 
 * 亲测：jquery库
 *  开启了externals，打包体积只有4.61KB
 *  不开启,打包体积为512KB
 * 
 * 备注：当忽略掉打包的库之后，需要手动在html中加入对应库的CDN连接
 * 
 */
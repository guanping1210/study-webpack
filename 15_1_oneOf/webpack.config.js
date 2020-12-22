const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'js/[name].[contenthash:8].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            // 例如针对js文件，同时运用了eslint-loader和babel-loader两条规则处理
            // 那么可能编译打包的时间会增加，因为会对同一个js文件处理两边
            // {
            //     test: /\.js$/,
            //     loader: 'eslint-loader',
            //     options: {
            //         fix: true
            //     }
            // },
            // {
            //     test: /\.js$/,
            //     loader: 'babel-loader',
            //     options: {
            //         presets: [
            //             [
            //                 '@babel/preset-env',
            //                 {
            //                     useBuiltIns: 'usage',
            //                     corejs: {
            //                         version: '3'
            //                     },
            //                     targets: {
            //                         chrome: '60',
            //                         firefox: '60',
            //                         // 设置了提取单独css文件的时候会报错
            //                         // ie与提取css文件插件之间好像有点儿问题
            //                         // ie: '10',
            //                         safari: '10',
            //                         edge: '17'
            //                     }
            //                 }
            //             ]
            //         ]
            //     }
            // },

            // 使用oneOf
            {
                oneOf: [
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
                    {
                        test: /\.js$/,
                        loader: 'eslint-loader',
                        options: {
                            fix: true
                        }
                    },
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
    mode: 'production',
}

/**
 * oneOf: 让文件只匹配一次loader，例如一类文件，写了多条规则，那么只让一个loader处理，而不会每个loader都去匹配一下
 *  能够加快编译和打包速度
 * 
 * 亲测:
 *  一个 add 函数，在没使用oneOf的情况下，检测了eslint和babel-loader，使用了1205ms
 *  在使用oneOf的情况下，就只匹配了一个loader，由于eslint写在前面，所以估摸着校验的eslint，而没有使用babel-loader，使用了789ms
 *  (匹配babel-loader, 没有运用eslint-loader, 只花费了652ms)
 * 
 * 结果：oneOf确实能够加快编译时间（因为文件只会经过一个loader的处理，而不会被所有loader匹配）
 * 
 */

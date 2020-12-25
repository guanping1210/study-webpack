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
    ],
    optimization: {
      usedExports: true, // 开发模式开启tree-shaking
    },
    // mode: 'production'
    mode: 'development',
}

/**
 * tree-shaking: 树摇，可以理解为定义了的模块或者函数，被调用了，就是绿色的叶子，没使用过的，就是黄色的叶子
 *               所以作用就是把定义过但是没使用过的模块或者函数，去除掉
 * 亲测：定义了print方法和add方法，只调用了add方法
 * 结果：在编译后的源码中，并没有print方法，只有add方法
 * 
 * 结论：能够减少打包后的资源体积，从而加快资源访问速度
 *       mode=development, 没启动tree-shaking，需要手动启动，而mode=production，默认启动了tree-shaking
 * 
 * 缺点：js中引入的第三方包或者css，没有显示调用的话，也会被shaking掉。
 * 解决：配置package.json的sideEffect属性使用( sideEffect 能够配置不需要shaking掉的文件格式)
 * 
 * 开启方式：
 *  1、mode=production，默认开启
 *  2、mode=development + optimization.usedExports 开启(亲测失败，编译成功，但是并没有shaking掉)
 * 
 * 工作原理：最早是由Rollup实现的，是一种采用删除不需要的额外代码的方式优化代码体积的技术
 *  1、利用 ES6模块特性
 *     - 只能能作为模块顶层的语句出现
 *     - import的模块名只能是字符串变量
 *     - import binding是immutable的，引入的模块不能再进行修改
 *  2、代码删除
 *     - uglfiy：判断程序流，判断变量是否被使用和引用，进而代码删除
 * 简单总结概括原理：
 *  1、ES6 Module引入进行静态分许，故而编译的时候正确判断到底加载了哪些模块
 *  2、静态分析程序流，判断那些模块和变量未被使用或引用，进而删除对应代码
 * 
 * 资料：
 *  https://cloud.tencent.com/developer/article/1624085
 *  https://juejin.cn/post/6844903544756109319
 * 
 */
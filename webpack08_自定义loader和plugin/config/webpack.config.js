/**
 * 自定义webpack
 */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new CleanWebpackPlugin()
  ],
  mode: 'development'
}


/**
 * webpack执行流程
 *  1、初始化Compiler: webpack(config) 得到Compiler对象
 *  2、开始编译：调用 Compiler 对象 run方法开始执行编译
 *  3、确定入口：根据配置中的 entry 找出所有的入口文件
 *  4、编译模块：从入口文件触发，调用所有配置的 Loader 对模块进行编译，再找出
 *     该模块依赖的模块，递归直到所有模块被加载进来
 *  5、完成模块编译：在经过第4步使用 Loader 编译完成所有模块后，得到了每个模块
 *     被编译后的最终内容以及他们之间的依赖关系
 *  6、输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的chunk,
 *     再把每个chunk 转换成一个单独的文件加入到输出列表（注意：这步是可以修改输出内容的最后机会）
 *  7、输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统
 */
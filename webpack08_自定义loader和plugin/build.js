/**
 * 自定义 webpack + loader + plugin
 */
const myWebpack = require('./lib/myWebpack')
const config = require('./config/webpack.webpack')

const compiler = myWebpack(config)

// 开始打包
compiler.run()

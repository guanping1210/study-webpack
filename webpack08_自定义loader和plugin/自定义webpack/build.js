const myWebpack = require('./lib')
const config = require('./webpack.config')

const compiler = myWebpack(config)
compiler.run()
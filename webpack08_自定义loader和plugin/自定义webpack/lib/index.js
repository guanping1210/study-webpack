const Compiler = require('./compiler')

const myWebpack = (config) => {
    const compiler = new Compiler(config)
    return compiler
}

module.exports = myWebpack
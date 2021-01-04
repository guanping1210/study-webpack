/**
 * webpack主流程：https://www.cnblogs.com/sunny-lucky/p/13857250.html
 * 1、读取config配置 --> 
 * 2、执行run函数进行编译
 */
const Compiler = require('./compiler')

/**
 * 
 * @param {*} config 配置
 */
const myWebpack = (config) => {
    // 配置校验
    // compiler 读取配置, 生成compilation实例
    const compiler = new Compiler(config)
    // 开始编译
    return compiler
}

module.exports = myWebpack
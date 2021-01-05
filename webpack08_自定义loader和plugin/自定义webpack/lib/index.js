const Compiler = require('./compiler')

const myWebpack = (config) => {
    const compiler = new Compiler(config)
    return compiler
}

module.exports = myWebpack

/**
 * 含义:
 *  Compiler: 是个对象,包含了webpack环境的所有配置信息,包含options\loaders\plugins等信息,
 *            这个对象在webpack启动时候被实例化,可以理解为是webpack实例
 *  Compilation: 也是个对象,包含了当前的模块资源, 编译生成资源,变化的文件等. 每次检测到一个文件
 *            变化时,一个新的Compilation就会被创建.
 * 
 * 区别:
 *  Compiler: 代表了整个webpack从启动到关闭的生命周期
 *  Compilation: 是Compiler实例出来的对象,代表了一次新的编译
 */
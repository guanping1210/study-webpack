const parseFromAST = require('./parse')
const buildGraph = require('./graph')
const buildOutput = require('./generate')

class Compiler {
    constructor(options) {
        this.options = options
        this.modules = []
    }

    run() {
        // 解析入口文件
        const ast = parseFromAST(this.options.entry)
        // 收集模块依赖

        // 构建依赖图
        const depsGraph = buildGraph(this.modules)

        // 输出bundle资源
        buildOutput(depsGraph)
    }
}

module.exports = Compiler
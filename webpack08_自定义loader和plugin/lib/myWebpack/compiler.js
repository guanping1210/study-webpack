/**
 * compiler执行器: 
 *  读取入口文件内容 --> 语法树处理
 */
// 读取源码，找到依赖，解析为ES5
const parserAST = require('./parser')
// 构建关系图
const buildGraph = require('./graph')
// 输出bundle资源
const buildOutput = require('./generate')


class Compiler {
    constructor(options) {
        this.options = options
        // 收集依赖
        this.modules = []
    }

    /**
     * 启动webpack打包
     * 功能: 1、读取入口文件内容
     *       2、解析为AST
     */
    run() {
        const filePath = this.options.entry
        // 第一次构建，得到入口文件的信息
        const entryInfo = parserAST(filePath)
        this.modules.push(entryInfo)

        // 递归收集依赖，遍历所有
        this.modules.forEach(info => {
            // 取出当前文件的所有依赖
            const deps = info.deps
            // 遍历
            for(const relativePath in deps) {
                // 得到当前模块依赖文件的绝对路径
                const absolute = deps[relativePath]
                // 对依赖文件进行处理
                const fileInfo = parserAST(absolute)
                // 将处理后的结果添加到modules中
                this.modules.push(fileInfo)
            }
        })

        // 将依赖整理为更好的关系依赖图
        const depsGraph = buildGraph(this.modules)

        // 生成最后的输出资源
        buildOutput(depsGraph, this.options)
    }
}

module.exports = Compiler

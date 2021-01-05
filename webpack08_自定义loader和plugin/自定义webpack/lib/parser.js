/**
 * 根据入口文件，对模块进行AST处理
 * 处理流程：
 *  1、读取文件内容 
 *  2、解析文件内容为AST
 *  3、收集该文件依赖的所有模块
 *  4、将AST编译为代码
 */

const fs = require('fs')
const path = require('path')
// 解析AST
const babelParse = require('@babel/parser')
// 收集依赖
const babelTraverse = require('@babel/traverse').default
// 编译AST处理
const { transformFromAst } = require('@babel/core')

const parserAST = (filePath) => {
    // 读取入口文件的内容
    const file = fs.readFileSync(filePath, 'utf-8')
    // 将文件内容解析为抽象语法树  --> 实际上就是用对象来表示我们的代码结构
    const ast = babelParse.parse(file, {
        sourceType: 'module', // 表示我们要解析的是ES模块
    })
    // 获取文件的文件夹路径
    const dirname = path.dirname(filePath)
    // 定义一个存储依赖的容器
    const deps = {}
    // 通过抽象语法树收集依赖的模块
    // @ts-ignore
    babelTraverse(ast, {
        // 内部遍历ast中的program.body，判断里面语句类型
        // 如果type是ImportDeclaration，就会触发当前函数
        ImportDeclaration({ node }) {
            // 文件相对路径： './add.js'
            const relativePath = node.source.value
            // 生成基于入口文件的绝对路径
            const absolutePah = path.resolve(dirname, relativePath)
            deps[relativePath] = absolutePah
        }
    })

    // @ts-ignore
    // 编译代码 --> 编译ast, 得到的code就是编译后的代码
    const { code } = transformFromAst(ast, null, {
        // @ts-ignore
        presets: ['@babel/preset-env']
    })


    return {
        // 模块路径
        filePath,
        // 该模块的所有依赖
        deps,
        // 该模块转化为ES5的代码
        code
    }
}

module.exports = parserAST

/**
 * AST处理流程：
 * 1、将模块内容解析为AST:
 *   @babel/parser
 * 
 * 2、遍历AST收集依赖：
 *   @babel/traverse + ImportDeclaration(表示对type类型为ImportDeclaration的节点的处理，也就是依赖模块的处理)
 * 
 * 3、ES6转ES5的过程：把ES6的AST转换为ES5的AST
 *   @babel/core + transformFromAst(就是将我们传入的AST转化成我们在第三个参数里配置的模块类型)
 *   @babel/preset-env
 * 
 */
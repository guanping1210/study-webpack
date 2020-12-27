
const fs = require('fs')
// const path = require('path')
// 解析AST
const babelParse = require('@babel/parser')
// 收集依赖
const babelTraverse = require('@babel/traverse').default
// 编译ast处理
const { transformFromAst } = require('@babel/core')

class Compiler {
  constructor(options = {}) {
    this.options = options
  }

  /**
   * 启动webpack打包的方法
   * 功能：1、读取入口文件内容
   *      2、将其解析为AST抽象语法树
   */
  run() {
    // 1、读取入口文件的内容
    const filePath = this.options.entry
    const file = fs.readFileSync(filePath, 'utf-8')

    // 2、解析抽象语法树 --> 实际上就是用对象来表示我们的那些代码的结构
    const ast = babelParse.parse(file, {
      sourceType: 'module', // 解析文件的模块化方案是 ES Module
    })
    console.log('ast', ast)

    // 获取到文件的文件夹路径
    const dirname = path.dirname(filePath)

    // 定义一个存储依赖的容器
    const deps = {}

    // 3、通过抽象语法树收集依赖的模块
    babelTraverse(ast, {
      // 内部会遍历ast中的program.body，判断里面语句类型
      // 如果type是ImportDeclaration，就会触发当前函数
      ImportDeclaration({ node }) {
        // 文件相对路径： './add.js'
        const relativePath = node.source.value
        // 生x成基于入口文件的绝对路径
        const absolutePath = path.resolve(dirname, relativePath)
        deps[relativePath] = absolutePath
      }
    })
    console.log('deps', deps)

    // 4、编译代码 --> 编译ast, 得到的code就是编译后的代码
    const { code } = transformFromAst(ast, null, {
      presets: ['@babel/preset-env']
    })
    console.log('code', code)
    
    return code
  }
}

const myWebpack = (config) => {
  return new Compiler(config)
}

module.exports = myWebpack
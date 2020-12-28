
const fs = require('fs')
const path = require('path')
// 解析AST
const babelParse = require('@babel/parser')
// 收集依赖
const babelTraverse = require('@babel/traverse').default
// 编译ast处理
const { transformFromAst } = require('@babel/core')

class Compiler {
  constructor(options = {}) {
    // webpack配置对象
    this.options = options
    // 所有依赖的容器
    this.modules = []
  }

  /**
   * 启动webpack打包的方法
   * 功能：1、读取入口文件内容
   *      2、将其解析为AST抽象语法树
   */
  // 启动webpack打包
  run() {
    // 入口文件路径
    const filePath = this.options.entry

    // 第一次构建，得到入口文件的信息
    const fileInfo = this.build(filePath)
    this.modules.push(fileInfo)

    // 递归收集依赖,遍历所有的
    this.modules.forEach((info) => {
      // 取出当前文件的所有依赖
      const deps = info.deps
      // 遍历
      for(const relativePath in deps) {
        // 得到当前模块依赖文件的绝对路径
        const absolutePath = deps[relativePath]
        // 对依赖文件进行处理
        const fileInfo = this.build(absolutePath)
        // 将处理后的结果添加到modules中，后面遍历就会遍历它了～
        this.modules.push(fileInfo)
      }
    })

    console.log('modules', this.modules)

    // 将依赖整理为更好的依赖关系图
    const depsGraph = this.modules.reduce((graph, module) => {
      return {
        ...graph,
        [module.filePath]: {
          code: module.code,
          deps: module.deps
        }
      }
    }, {})

    console.log('依赖图', depsGraph)

    // 生成最后的输出资源
    this.generate(depsGraph)
  }

  // 开始构建
  build(filePath) {
    // 1、读取入口文件的内容
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
    
    return {
      // 文件路径
      filePath,
      // 当前文件的所有依赖
      deps,
      // 当前文件解析后的代码
      code
    }
  }

  // 构建输出资源
  generate(depsGraph) {
    /*  index.js 的代码
      
    */
    const bundle = `
      (function(depsGraph) {
        // require目的：为了加载入口文件
        function require(module) {
          // 定义模块内部的require函数
          function localRequire(relativePath) {
            // 为了找到当前模块的绝对路径，通过require加载进来
            return require(depsGraph[module].deps[relativePath])
          }

          // 定义的暴露对象：将来模块要暴露的内容
          var exports = {}

          (function(require, exports, code) {
            eval(depsGraph[module].code)
          })(localRequire, exports, depsGraph[module].code)

          // 作为require函数的返回值返回出去
          // 暴露出去的目的：为了后面的require函数能够得到暴露的内容
          return exports
        }

        require('${this.options.entry}')
      })(${JSON.stringify(depsGraph)})
    `

    // 生成输出文件的绝对路径
    const bundlePath = path.resolve(this.options.output.path, this.options.output.filename)
    // 将bundle内容输入到文件中，使用fs写入文件
    fs.writeFileSync(bundlePath, bundle, 'utf-8')
  }
}

const myWebpack = (config) => {
  return new Compiler(config)
}

module.exports = myWebpack
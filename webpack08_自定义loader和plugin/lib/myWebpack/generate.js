/**
 * 将关系依赖图，变为最后的输出资源
 *  1、构建相关文件
 *  2、将文件内容放入文件
 *  3、将文件放入到指定目录下
 */
const path = require('path')
const fs = require('fs')

const buildOutput = (depsGraph, options) => {
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
    var exports = {};

    (function(require, exports, code) {
      eval(depsGraph[module].code)
    })(localRequire, exports, depsGraph[module].code)

    // 作为require函数的返回值返回出去
    // 暴露出去的目的：为了后面的require函数能够得到暴露的内容
    return exports
  }

  require('${options.entry}')
})(${JSON.stringify(depsGraph)})
`

    // 生成输出文件的绝对路径
    const bundlePath = path.resolve(options.output.path, options.output.filename)
    // 将bundle内容输入到文件中，使用fs写入文件
    fs.writeFileSync(bundlePath, bundle, 'utf-8')
}

module.exports = buildOutput

/**
 * 整理输出的bundle资源：
 *  1、将关系图传给一个立即执行函数
 *  2、将主文件路径传入require函数执行
 *  3、执行require函数的时候，又立即执行一个立即执行函数，把code传进去
 *  4、执行eval(code), 执行code这段代码
 */
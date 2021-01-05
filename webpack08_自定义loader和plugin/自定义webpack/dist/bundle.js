
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

  require('./src/index.js')
})({"./src/index.js":{"code":"\"use strict\";\n\nconsole.log('自定义webpack');","deps":{}}})

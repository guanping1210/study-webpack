const { getOptions } = require('loader-utils')
const { validate } = require('schema-utils')
const babel = require('@babel/core')
const util = require('util')

const babelSchema = require('./babelSchema.json')


// babel.transform用来编译代码的方式
// 是一个普通的异步方法
// util.promisify将普通异步方法转化成基于promise的异步方法
const transform = util.promisify(babel.transform)

// loader处理任务有两种方式：同步 ｜ 异步
// 一般采用异步，性能更好
module.exports = function(content, map, meta) {
  // 获取loader的options配置
  const options = getOptions(this) || {}
  // 校验babel的options的配置
  validate(babelSchema, options, {
    name: 'Babel Loader'
  })

  // 创建异步
  const callback = this.async()

  // 使用babel
  transform(content, options) 
    .then(({ code, map }) => {
      callback(null, code, map, meta)
    })
    .catch(e => {
      callback(e)
    })
}
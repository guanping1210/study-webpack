/**
 * loader本质上是一个函数
 */

// 用来获取loader的options配置
const { getOptions } = require('loader-utils')
// 验证options是否复合规范  --> 规则写在schema.json文件中
const { validate } = require('schema-utils')
const schema = require('./schema.json')

module.exports = function(content, map, meta) {
  console.log('打印内容3333', content)
  // 获取options
  const options = getOptions(this)
  console.log('打印options3333', options)

  // 校验options是否合法
  // 合法继续往下走，不合法则推出流程
  validate(schema, options, {
    name: "loader3"
  })
  
  return content
}

module.exports.pitch = function() {
  console.log('pitch 333')
}
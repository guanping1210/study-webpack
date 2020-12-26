/**
 * loader本质上是一个函数
 */

 module.exports = function(content, map, meta) {
   console.log('打印内容2222', content)

   return content
 }

 module.exports.pitch = function() {
  console.log('pitch 222')
}
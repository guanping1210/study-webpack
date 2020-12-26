/**
 * loader本质上是一个函数
 */

//  同步loader
//  module.exports = function(content, map, meta) {
//    console.log('打印内容111', content)

//    return content
//  }

//  同步loader
// module.exports = function(content, map, meta) {
//   console.log('打印内容111', content)

//   this.callback(null, content, map, meta)

//   // return content
// }

// 异步loader --> 推荐使用，性能较好
module.exports = function(content, map, meta) {
  console.log('打印内容111', content)

  const callback = this.async()
  setTimeout(() => {
    callback(null, content)
  }, 1000)

}


 module.exports.pitch = function() {
   console.log('pitch 111')
 }
/**
 *  每个plugin都是一个类
 * 
 *  生命周期函数一定是按照顺序执行的
 *  前面的执行完了，才能执行下一个
 * 
 *  compliation 是个对象
 */

class Plugin1 {

  apply(complier) {
    complier.hooks.emit.tap('Plugin1', (compliation) => {
      console.log('emit.tap触发了，')
    })

    // 异步钩子：tapAsync | tapPromise
    complier.hooks.emit.tapAsync('Plugin1', (compliation, cb) => {
      setTimeout(() => {
        console.log('emit.tapAsync')
        cb()
      }, 1000)
    })

    complier.hooks.afterEmit.tap('Plugin1', (compliation) => {
      console.log('afterEmit.tap触发了，')
    })

    complier.hooks.done.tap('Plugin1', (compliation) => {
      console.log('done.tap触发了，')
    })
  }
}

module.exports = Plugin1
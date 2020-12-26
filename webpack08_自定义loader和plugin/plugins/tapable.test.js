/**
 * tapable 是 webpack的complier的核心
 * 提供了很多钩子，也就是插件会使用到的钩子
 * 
 * 流程就是: 
 *  plugins运行的时候会触发webpack complier下的各个钩子函数
 */
const { SyncHook, SyncBailHook, AsyncParallelHook, AsyncSeriesHook } = require('tapable')

class Lesson {
  constructor() {
    // 初始化hooks容器
    this.hooks = {
      // 测试SyncHook与SyncBailHook的区别:
      //  SyncBailHook: 一旦有返回值就会退出
      // 这两个钩子都是同步执行的钩子
      go: new SyncHook(['address']),

      // 异步钩子 -->  异步并行钩子
      // AsyncParallelHook：异步并行
      // AsyncSeriesHook：异步串行
      leave: new AsyncParallelHook(['name', 'age'])
    }
  }

  // 往hooks中注册相应的事件/添加回调函数
  tap() {
    this.hooks.go.tap('class0318', (address) => {
      console.log('class0318', address)
    })

    this.hooks.go.tap('class0410', (address) => {
      console.log('class0410', address)
    })

    // 异步钩子 tapAsync ｜ tapPromise
    // 实测是并行执行的
    this.hooks.leave.tapAsync('class0510', (name, age, cb) => {
      setTimeout(() => {
        console.log('class0510', name, age)
        cb()
      }, 1000)
    })

    // tapPromise：没有回调函数，需要返回的是一个Promise
    this.hooks.leave.tapAsync('class0610', (name, age) => {
      return new Promise(resolve => {
        setTimeout(() => {
          console.log('class0610', name, age)
          resolve()
        }, 1000)
      })
    })
  }

  start() {
    // 触发钩子函数
    this.hooks.go.call('c318')
    this.hooks.leave.callAsync('jack', 18, function() {
      // 代表leave容器中的函数触发完了，才触发
      console.log('end ~~~')
    })
  }
}

const t = new Lesson()
t.tap()
t.start()
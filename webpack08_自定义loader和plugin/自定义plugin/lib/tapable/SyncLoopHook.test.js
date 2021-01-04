/**
 * SyncLoopHook: 串行同步执行，事件函数返回true表示循环执行当前处理函数，返回undefined表示结束循环
 */
const { SyncLoopHook } = require('tapable')

const instance = new SyncLoopHook(['name', 'age'])

let count = 0

// 如果直接返回true， 则会一直循环
instance.tap('1', (name, age) => {
    console.log('1', name, age)
    return count ++ < 2 ? true : undefined
})

instance.tap('2', data => {
    console.log('2', data)
    return count ++ < 2 ? true : undefined
})

instance.tap('3', data => {
    console.log('3', data)
})

const res = instance.call('panda', 18)
console.log(res)

/**
 * 模拟SyncLoopHook
 */
class MySyncLoopHook {
    constructor(...args) {
        this.args = args
        this.taskList = []
    }

    tap(name, task) {
        this.taskList.push(task)
    }

    call(...args) {
        // 参数不足
        if(args.length < this.args.length) throw Error('参数不足')

        // 传入的参数与实例参数严格对应，执行时多余的参数为undefined
        args = args.slice(0, this.args.length)

        // 事件处理返回true，表示循环执行当前处理函数
        // 只有返回undefined, 才能中止循环
        this.taskList.forEach(task => {
            let ret = task(...args)
            while(ret === true || ret !== undefined) {
                 ret = task(...args)
            }
        })
        
    }
}
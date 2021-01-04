/**
 * SyncBailHook: 串行同步执行，有返回值则略过后面的事件处理函数
 */

const { SyncBailHook } = require('tapable')

const syncBailHook = new SyncBailHook(['name', 'age'])

syncBailHook.tap('1', (name, age) => {
    console.log('1', name, age)
})

syncBailHook.tap('2', (name, age) => {
    console.log('2', name, age)
    return name
})

syncBailHook.tap('3', (name, age) => {
    console.log('4', name, age)
})

// 最后只打印2和2， 因为2返回了值，3就不执行了
syncBailHook.call('panda', 18)

/**
 * 模拟SyncBailHook
 */
class MySyncBailHook {
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

        // 依次执行事件处理函数，如果遇到有返回值，直接break
        // of --> 数组中的值
        // in --> 数组中的下标
        for(let task of this.taskList) {
            const res = task()

            if(res) {
                break
            }
        }
    }
}
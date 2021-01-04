/**
 * test SyncHook --> 不关心返回值，按照注册顺序依次执行
 * 构建实例  --> 注册事件  --> 触发事件，让监听函数执行
 */

const {
    SyncHook
} = require('tapable')

const syncHook = new SyncHook(['name', 'age'])

syncHook.tap('1111', (name, age) => {
    console.log('1111', name, age)
})

syncHook.tap('2222', (name, age) => {
    console.log('2222', name, age)
})

// 1111 和 2222 按照注册顺序打印
syncHook.call('panda', 18)

// 模拟SyncHook
class MySyncHook {
    constructor(args) {
        this.args = args
        this.taskList = []
    }

    tag(name, task) {
        this.taskList.push(task)
    }

    call(...args) {
        // 参数不足
        if(args.length < this.args.length) throw Error('参数不足')

        // 传入的参数与实例参数严格对应，执行时多余的参数为undefined
        args = args.slice(0, this.args.length)

        // 依次执行事件处理函数
        this.taskList.forEach(v => v(...args))
    }
}
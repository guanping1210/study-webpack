/**
 *  SyncWaterfallHook: 串行同步执行，上一个事件的结果作为下一个事件的参数，依次推类
 *  注意：第一个事件处理函数接收的是实例化定义的参数，其他的接收的是上一次的返回值
 */
const { SyncWaterfallHook } = require('tapable')

const instance = new SyncWaterfallHook(['name', 'age'])

instance.tap('1', (name, age) => {
    console.log('1', name, age)
    return '1'
})

instance.tap('2', data => {
    console.log('2', data)
    return '2'
})

instance.tap('3', data => {
    console.log('3', data)
    return '3'
})

const res = instance.call('panda', 18)
console.log(res)

/**
 * 模拟SyncWaterfallHook
 */
class MySyncWaterfallHook {
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

        // 找个变量记录上一次的执行结果，下一次作为参数传递进去
        // 迭代递归
        const [first, others] = this.taskList

        // 通俗易懂的写法
        // let res = first(...args)
        // for(let task of others) {
        //     res = task(res)
        // }

        // return res

        return others.reduce((ret, task) => task(ret), first(...args))
    }
}
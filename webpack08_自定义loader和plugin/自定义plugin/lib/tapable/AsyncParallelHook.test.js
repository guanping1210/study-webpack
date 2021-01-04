/**
 * AsyncParallelHook: 异步并行执行, 通过tapAsync\tapPromise注册事件,通过callAsync\promise触发
 */
const { AsyncParallelHook } = require('tapable')

const instance = new AsyncParallelHook(['name', 'age'])

// done 表示最后一个参数, 执行则表示执行完成
instance.tapAsync('1', (name, age, done) => {
    setTimeout(() => {
        console.log('1', name, age)
        done()
    }, 2000)
})

instance.tapAsync('2', (name, age, done) => {
    setTimeout(() => {
        console.log('2', name, age)
        done()
    }, 1000)
})

// 执行顺序是 2 -> 1, 说明是按照异步时长来执行的
// 异步时间短的先执行,和注册顺序无关了
instance.callAsync('panda', 18, () => {
    console.log('执行完了~~')
})

// tapPromise 注册事件,要求必须返回一个promise
instance.tapPromise('3', (name, age) => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('3', name, age)
            resolve(100)
        }, 5000)
    })
})

instance.tapPromise('4', (name, age) => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('4', name, age)
            resolve(200)
        }, 4000)
    })
})

// promise执行
instance.promise('panda', 18)
    .then(res => {
        console.log(res)
    })

class MyAsyncParallelHook {
    constructor(args) {
        this.args = args
        this.taskList = []
    }

    tagAsync(name, task) {
        this.taskList.push(task)
    }

    tapPromise(name, task) {
        this.taskList.push(task)
    }

    callAsync(...args) {
        // 先取出最后一个回调函数
        const finalCallback = args.pop()

        // 传入的参数与实例参数严格对应，执行时多余的参数为undefined
        args = args.slice(0, this.args.length)

        // 定义一个i变量和done函数,每次执行检测i和队列长度,决定是否执行callAsync的回调函数.也就是finalCallback
        let i = 0
        const done = () => {
            if(++i === this.taskList.length) {
                finalCallback()
            }
        }

        // 依次处理事件处理函数
        this.taskList.forEach(task => task(...args, done))
    }

    promise(...args) {
        // 传入的参数与实例参数严格对应，执行时多余的参数为undefined
        args = args.slice(0, this.args.length)

        // 所有同步运行,等到所有都执行完毕,才返回结果
        return Promise.call(this.taskList.map(task => task(...args)))
    }
}
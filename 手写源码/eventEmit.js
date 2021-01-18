/**
 * trigger，模拟实现addEventListener，实现绑定函数、执行函数、解绑函数
 * 
 * 核心：用一个map类型来记录注册的事件类型
 */

class EventEmitter {
    constructor() {
        this.events = {}
    }

    on(type, fn) {
        if(this.events[type]) {
            this.events[type].push(fn)
        } else {
            this.events[type] = [fn]
        }
    }

    off(type, fn) {
        if(this.events[type].some(event => event === fn)) {
            this.events[type] = this.events[type].filer(event => event !== fn)
        } else {
            this.events[type] = []
        }
    }

    emit(type) {
        this.events[type].forEach(fn => fn())
    }
}

var emitter = new EventEmitter()
emitter.on('click', () => {
    console.log(123)
})
emitter.on('click', () => {
    console.log(567)
})
emitter.emit('click')


/**
 * 节流：规定时间内只能触发一次
 */
function throttle(fn, delay) {
    let prev = Date.now()

    return function() {
        let context = this
        let args = arguments

        let now = Date.now()

        if(now - prev >= delay) {
            fn.apply(context, args)
            prev = Date.now()
        }
    }
}
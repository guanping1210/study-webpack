/**
 * 防抖：在规定时间内触发多次，那么按照最后依次的触发重新计时
 */
function debounce(fn, delay) {
    let timer = null

    return function() {
        let context = this
        let args = arguments

        clearTimeout(timer)

        timer = setTimeout(() => {
            fn.apply(context, args)
        }, delay)
    }
}
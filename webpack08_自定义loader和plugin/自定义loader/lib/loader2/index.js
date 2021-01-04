/**
 * 异步loader: this.async --> module.exports 模块化
 * 注意：不能使用箭头函数，因为没有 this
 * @param {*} content 
 */
const myLoader = function (content) {
    console.log('异步loader')
    const callback = this.async()

    // 等待2s执行
    setTimeout(() => {
        callback(null, content)
    }, 2000)

    return content
}

module.exports = myLoader
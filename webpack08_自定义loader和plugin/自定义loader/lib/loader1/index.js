/**
 * loader：本质上就是个函数
 */
// 同步loader
const myLoader = (content) => {
    console.log('自定义loader运行')

    return content
}

module.exports = myLoader
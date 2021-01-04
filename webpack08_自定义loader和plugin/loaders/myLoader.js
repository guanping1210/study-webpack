/**
 * loader：本质上就是一个函数
 */

const myLoader = function(content, map, meta) {
    console.log(111, content, map, meta)
}

module.exports = myLoader
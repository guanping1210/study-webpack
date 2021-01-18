/**
 * https://www.cnblogs.com/chenwenhao/p/11294541.html#_label0
 * 
 * new的原理：1、创建一个对象
 *           2、链接到原型
 *           3、绑定this
 *           4、返回新对象
 * 目前还是靠记忆---
 */
function myNew(Con) {
    const obj = {}

    obj.__proto__ = Con.prototype
    const ret = Con.apply(obj)

    return ret instanceof Object ? ret : obj
}
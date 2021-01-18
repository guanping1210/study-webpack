/**
 * 核心：根据原型链，不断的找，直到找到null为止
 * 原理：实例.__proto__ === 原型
 *      原型.constructor === 构造函数
 *      构造函数.prototype === 原型
 * 
 *      实例.__proto__ === 原型 === 构造函数.prototype
 * 
 * 其实就是找实例的__proto__属性，形成的一条链路，根据这条链路一直往上查找，
 * 直到找到等于构造函数的.prototype或者找到null位置
 * 
 */
function myInstanceof(target, origin) {
    let prop = target.__proto__

    while(true) {
        if(prop === null) {
            return false
        }

        if(prop === origin.prototype) {
            return true
        }

        prop = target.__proto__
    }

}

var b = new Object()
console.log(b instanceof Object) // true

console.log(myInstanceof(b, Object)) // true




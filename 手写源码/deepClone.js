/**
 * 大体思路：对克隆的对象属性进行判断，是对象就一直克隆下去
 *          注意有些边界条件的判断
 */
function deepClone(obj) {
    if(typeof obj !== 'object') return obj

    const newObj = {}

    for(let key in obj) {
        if(typeof obj[key] === 'object') {
            newObj[key] = deepClone(obj[key])
        }

        newObj[key] = obj[key]
    }

    return newObj
}

var b = { person: { name: { age: 20 }, age: 30 }, sex: 0 }
var b = deepClone(b)

console.log(b) // b拥有的属性和a相同

b.sex = 100 // 改动b.sex，不会影响到a.sex

// 实测：克隆成功
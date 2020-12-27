console.log(111)
import add from './add.js'
import count from './count'


class Person {
  constructor(name) {
    this.name = name
  }
  setName(name) {
    this.name = name
  }
}

const p = new Person('guanping')

console.log('测试自定义babel', p)

console.log('add', add(1,2))
console.log('count', count(3,4))
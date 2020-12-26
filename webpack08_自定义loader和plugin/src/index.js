console.log(111)

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
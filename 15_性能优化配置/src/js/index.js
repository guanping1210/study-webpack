// 引入iconfont 样式文件
import '../../assert/iconfont.css'
import './print'
console.log(111)

console.log('kkk2')

if(module.hot) {
  // 一旦module.hot为true, 说明开启了HMR功能  --> 让HMR功能代码生效
  module.hot.accept('./print.js', function() {
    // 方法会监听print.js文件的变化，一旦发生变化，其他模块不会重新打包构建
    // 会执行后面的回调函数
    print()
  })
}
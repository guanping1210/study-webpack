// eslint-disable-next-line
// import(/* webpackChunkName: lodash */ 'lodash')
import _ from 'lodash'

function sum(...args) {
  return Array.from(args).reduce((c, p) => c + p, 0);
}

// eslint-disable-next-line
console.log(sum(1, 2, 3, 4, 5));

/**
 * 通过js代码，让某个文件被单独打包为一个chunk
 * import 动态导入语法：能将某个文件单独打包， 但是默认的文件名是有一个计算的ID来的
 * 可以通过自定义webpackChunkName来指定动态引入文件的文件名字
 */
import(/* webpackChunkName: 'print' */ './print')
  .then(res => {
    console.log(res)
  })
  .catch(() => {
    console.log('文件加载失败')
  })





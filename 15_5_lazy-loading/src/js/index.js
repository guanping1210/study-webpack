console.log('index.js文件被加载了')

// 这样就是提前加载好了

// 懒加载：讲道理，这会儿其实还没加载print.js，但是为什么这儿的add有值呢？
// 最后实验是成功的：刚没成功是因为文件名一样，缓存没刷新
// 也不会重复加载同一个文件，会读取缓存
// console.log(add)

document.getElementById('btn').addEventListener('click', () => {
  // 懒加载
  import(/* webpackChunkName: 'test' */'./print').then(({ add }) => {
    console.log('我已经加载好了～～～', add(10,20))
  })
  // 预加载: webpackPrefetch 开启预加载
  import(/* webpackChunkName: 'test', webpackPrefetch: true  */'./print').then(({ add }) => {
    console.log('我已经加载好了～～～', add(10,20))
  })
})
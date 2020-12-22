import './test.css'
import { add } from './print'

console.log(add(1,2))

// 注册serviceworker
// 处理兼容性问题
if('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => {
        console.log('serviceworker 注册成功了')
      })
      .catch(() => {
        console.log('sw 注册失败')
      })
  })
}

// 针对eslint检测识别不到window\navigator等现象
// 需要在eslintConfig中添加env: { browser: true }, 表示支持浏览器的全局变量

// sw代码必须运行在服务器上
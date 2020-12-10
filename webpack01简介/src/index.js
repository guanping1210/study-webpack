/**
 * webpack 入口起点文件
 * 
 * 1、运行指令
 *  1.1 开发环境 webpack ./src/index.js -o ./build/built.js --mode=development
 *    表示webpack会以为 ./src/index.js 为入口文件开始打包，打包后输出到 ./build/built.js
 *  1.2 生产环境 开发环境 webpack ./src/index.js -o ./build/built.js --mode=development
 *    表示webpack会以为 ./src/index.js 为入口文件开始打包，打包后输出到 ./build/built.js
 * 
 * 2、结论
 *  2.1、webpack能够处理js/json文件, 不能处理css/img等其他资源
 *  2.2、生产环境和开发环境能将ES6模块化编译称浏览器能识别的模块化
 *  2.3、生产环境比开发环境多一个压缩js代码
 * 
 */

 import Data from './data.json.js.js'
 import './index.css'

 function add(x,y) {
   return x + y
 }

 console.log(add(1,2))
 console.log('data', Data)
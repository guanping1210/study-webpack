/**
 * 研究compliation --> 本身是个对象
 */
const fs = require('fs')
const util = require('util')
const path = require('path')

// webpack5的sources -->  RawSource
const webpack = require('webpack')

// 将fs.readFile方法变成基于promise风格的异步方法
const readFile = util.promisify(fs.readFile)

class Plugin2 {
  apply(complier) {
    // 初始化compliation钩子
    complier.hooks.thisCompliation.tap('Plugin2', (compliation) => {
      console.log(compliation)
      // 添加资源
      compliation.hooks.additionalAssets.tapAsync('Plugin2', async (cb) => {

        const content = 'hello plugin2'
        // 往要输出的资源中，添加一个a.txt文件
        // 还未亲测
        compliation.assets['a.txt'] = {
          // 文件大小
          size() {
            return content.length
          },
          // 文件具体内容
          source() {
            return content
          }
        }

        // 读取b.txt文件，追加到输出的资源中
        // webpack4的写法
        // 如果是5的写法，能够直接使用webpack.sources.RawSource
        const res = await readFile(path.resolve(__dirname, 'b.txt'))
        compliation.assets['b.txt'] = {
          // 文件大小
          size() {
            return res.length
          },
          // 文件具体内容
          source() {
            return res
          }
        }

        // 执行到cb，标示前面都执行完了了
        cb()
      })
    })
  }
}

module.exports = Plugin2
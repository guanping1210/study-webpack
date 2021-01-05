/**
 * plugin: 本身是个具有apply属性的Javascript对象, apply属性会被Compiler调用,
 *         并且compiler对象可在整个编译生命周期访问
 * 组成部分:
 *   1. 一个Javascript类
 *   2. 具有一个apply方法, 接收的参数就是compiler对象
 *   3. 指定一个绑定到webpack自身的事件钩子
 *   4. 处理webpack内部实例的特定数据
 *   5. 功能完成后调用webpack提供的回调
 * 
 * 联系: 使用compiler对象, 能够访问到compilation对象
 * 
 * compiler相关钩子: https://www.webpackjs.com/api/compiler-hooks/
 * compilation相关钩子: https://www.webpackjs.com/api/compilation-hooks/
 * 
 * compiler.hooks.xxx.yyy: xxx 表示compiler钩子, yyy 表示xxx绑定的钩子类型(同步|异步)
 * 
 */
const fs = require('fs')
const util = require('util')
const path = require('path')

const readFile = util.promisify(fs.readFile)

 // 模拟一个将a.txt文件内容写入b.txt文件的插件
class MyPlugin {
    constructor(options = {}) {
        this.options = options
    }

    apply(compiler) {
        // 初始化compilation钩子
        compiler.hooks.thisCompilation.tap('MyPlugin', (compilation) => {
            compilation.hooks.additionalAssets.tapAsync('MyPlugin', async(cb) => {
                const content = 'hello, my plugin'
                // assets表示输出的资源:
                // 输出资源中追加一个a.txt文件: 文件大小+文件内容
                compilation.assets['a.txt'] = {
                    size() {
                        return content.length
                    },
                    source() {
                        return content
                    }
                }

                // 读取用户自定义的b.txt文件, 把b.txt文件的输出到最后资源中
                
                const res = await readFile(path.resolve(__dirname, 'b.txt'))
                compilation.assets['b.txt'] = {
                    size() {
                        return res.length
                    },
                    source() {
                        return res
                    }
                }

                // 亲测成功的把a.txt和b.txt添加到了dist目录下

                cb()
            })
        })
    }
}

module.exports = MyPlugin
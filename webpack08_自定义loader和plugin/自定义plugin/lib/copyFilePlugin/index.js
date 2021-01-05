/**
 * 基于plugin2,把a.txt和b.txt文件添加到输出资源中的实战,
 * 实现一个把指定文件夹下的文件拷贝到输出目录中的Plugin
 * 
 */
const fs = require('fs')
const utils = require('util')
const path = require('path')
// 专门用来匹配文件列表的
const globby = require('globby')
const { RawSource } = require('webpack-sources')
const { validate } = require('schema-utils')
const schema = require('./schema.json')

const readFile = utils.promisify(fs.readFileSync)

class CopyFilePlugin {
    constructor(options = {}) {
        // @ts-ignore
        validate(schema, options, {
            name: 'CopyFilePlugin'
        })
        this.options = options
    }

    apply(compiler) {
        compiler.hooks.thisCompilation.tap('CopyFilePlugin', (compilation) => {
            compilation.hooks.additionalAssets.tapAsync('CopyFilePlugin', async(cb) => {
                const { from, ignore } = this.options
                const to = this.options.to || '.'

                // 等同于process.cwd(), 获取运行指令的目录
                const context = compiler.options.context
                // 统一路径: 不能使用__dirname, 而是要用上下文来生成路径
                const absolutePath = path.isAbsolute(from) ? from : path.resolve(context, from)
                // 过滤掉需要忽略的文件
                // ignore = ['index.html'] --> 忽略不成功
                // ignore = ['**/index.html'] --> 忽略成功，表示忽略paths中的所有index.html文件
                // 实际上paths是个空字符串, 估计globby有问题
                const paths = await globby(absolutePath, { ignore })

                // 读取文件中的资源
                const files = await Promise.all(
                    paths.map(async(absolutePath) => {
                        // 读取文件内容
                        const data = await readFile(absolutePath, 'utf-8')
                        // 获取文件名,basename是得到最后的文件名以及后缀
                        const relativePath = path.basename(absolutePath)
                        // 把to属性与文件名结合一下(有to --> css/xxx; 没有to --> xxx)
                        const filename = path.join(to, relativePath)

                        return {
                            data, filename
                        }
                    })
                )

                // 处理生成webpack格式的资源
                const assets = files.map(file => {
                    const source = RawSource(file.data)

                    return { source, filename: file.filename }
                })

                // 最后输出资源
                assets.forEach(asset => {
                    compilation.emitAsset(asset.filename, asset.source)
                })

                // 执行完毕
                cb()
            })
        })
    }
}

module.exports = CopyFilePlugin
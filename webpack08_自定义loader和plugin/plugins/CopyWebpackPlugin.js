/**
 * Copy-Webpack-Plugin
 * 功能：实现把public下面的文件，拷贝到dist目录下, 能够指定忽略一些文件
 */
const { validate } = require('schema-utils')
// 专门用来匹配文件列表的
const globby = require('globby')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const webpack = require('webpack')
const schema = require('./schema.json')

const readFile = promisify(fs.readFile)
// sources 这个东西只有webpack5有，wepack4好像是单独的插件，需要查一下
// const { RawSource } = webpack.sources
const { RawSource} = require('webpack-sources')

class CopyWebpackPlugin {
  constructor(options = {}) {
    // 验证options是否复合规范
    validate(schema, options, {
      name: 'CopyWebpackPlugin'
    })

    this.options = options
  }

  apply(compiler) {
    // 初始化compilation的钩子函数
    compiler.hooks.thisCompilation.tap('CopyWebpackPlugin', async (compilation) => {
      // 添加资源的hooks
      compilation.hooks.additionalAssets.tapAsync('CopyWebpackPlugin', async (cb) => {
        // 目的：将from中的资源复制到to中，输出出去
        const { from, ignore } = this.options
        const to = this.options.to ? this.options.to : '.'
        /**
         * 1、读取from中的所有资源 --> globby(要处理的文件夹，其他条件)
         *    需要统一为绝对路径  --> path.isAbsolute
         */
      
        // context就是webpack配置的上下文，也就是运行指令的目录 
        // process.cwd()
        const context = compiler.options.context
        // 统一路径：不能使用__dirname，而是要使用上下文来生成路径
        const absolutePath = path.isAbsolute(from) ? from : path.resolve(context, from)
        // 1、读取文件 +  过滤掉ignore中指定的文件
        // ignore = ['index.html'] --> 忽略不成功
        // ignore = ['**/index.html'] --> 忽略成功，表示忽略paths中的所有index.html文件
        const paths = await globby(absolutePath, { ignore })
        
        // paths标示所有要加载的文件路径数组
        console.log('路径', paths, to, ignore)
        
        //  2、读取paths中所有资源
        const files = await Promise.all(
          paths.map(async(absolutePath) => {
            // 读取文件, data就是文件数据
            const data = await readFile(absolutePath)
            // 获取文件名，basename就是得到最后的文明名称
            const relativePath = path.basename(absolutePath)
            // 把to属性与文件名结果一下
            // 没有to --> reset.css
            // 有to --> 例如就是 css/reset.css
            const filename = path.join(to, relativePath)

            return { data, filename }
          })
        )

        //  3、生成webpack格式的资源
        const assets = files.map(file => {
          const source = new RawSource(file.data)
          return {
            source,
            filename: file.filename
          }
        })
        //  4、添加到compilation中，输出出去
        assets.forEach(asset => {
          compilation.emitAsset(asset.filename, asset.source)
        })

        // 终结流程
        cb()

        /**
         * 测试结果：确实打包了，但是没找到dist文件夹呢，需要排查一下
         */
      })
    })
  }
}

module.exports = CopyWebpackPlugin
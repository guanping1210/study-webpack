/**
 * 自定义babel-loader: 对js进行babel处理
 */
const babel = require('@babel/core')
const util = require('util')
const { getOptions } = require('loader-utils')
const { validate } = require('schema-utils')
const schema = require('./schema.json')

// util.promisify将普通异步方法转化成基于promise的异步方法
const transform = util.promisify(babel.transform)

const babelLoader = function(content, map, meta) {
    const options = getOptions(this) || {}

    validate(schema, options, {
        name: 'Babel Loader'
    })

    console.log('自定义babel-loader')

    const callback = this.async()

    // @ts-ignore
    transform(content, options)
        .then(({ code, map }) => {
            callback(null, code, map, meta)
        })
        .catch(e => {
            callback(e)
        })
}

module.exports = babelLoader
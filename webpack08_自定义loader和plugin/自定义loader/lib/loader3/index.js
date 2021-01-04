// 用来获取loader的options配置
const { getOptions } = require('loader-utils')
// 验证options是否复合规范  --> 规则写在schema.json文件中
const { validate } = require('schema-utils')
// 配置规则
const schema = require('./schema.json')

/**
 * loader配置options，可校验 
 * @param {*} content 
 */
const myLoader = function (content) {
    const options = getOptions(this)
    // @ts-ignore
    validate(schema, options, {
        name: 'myLoader'
    })
    console.log('options校验的loader', options)

    return content
}

module.exports = myLoader
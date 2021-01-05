/**
 * 递归：把所有依赖构建为关系图
 * @param {*} modules 所有依赖
 */
const buildGraph = (modules = []) => {
    return modules.reduce((graph, module) => {
        return {
            ...graph,
            [module.filePath]: {
                code: module.code,
                deps: module.deps
            }
        }
    }, {})
}

module.exports = buildGraph
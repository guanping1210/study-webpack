/**
 * 自定义 webpack + loader + plugin
 * 流程：读取配置 --> 递归编译模块文件(loader编译源码 + ast转换) --> 装载模板文件 --> 生成最终JS文件
 * 
 * compiler: 扩展自Tapable类，能够创建一个compilation(编译)实例，方便注册和调用插件  --> https://www.webpackjs.com/api/compiler-hooks/
 *      1、支持监控文件系统的watching机制，处于监听模式时, 会触发watchRun,watchClose喝invalid时间
 *      2、相关生命周期钩子函数：--> 具体看钩子类型：tapAsync | tapPromise |   --> 绑定模式：compiler.hooks.xxx.tapXXX()
 *          entryOptions 
 *          afterPlugins
 *          afterResolvers
 *          beforeRun：compiler.run执行之前，添加一个钩子
 *          run：
 *          beforeCompile：compilation参数创建之后，执行查看
 *          compile：一个新的编译实例创建后，勾入compiler
 *          thisCompilation：触发compilation事件之前执行 
 *          compilation：编译创建之后，执行插件
 *          emit: 生成资源道output目录之前，修改源码的最后机会
 *          done: 编译完成
 * 
 * 资料： https://aotu.io/notes/2020/07/17/webpack-analize/index.html
 * 
 * 
 */
const myWebpack = require('./lib/myWebpack')
const config = require('./config/webpack.webpack')

const compiler = myWebpack(config)

// 开始打包
compiler.run()

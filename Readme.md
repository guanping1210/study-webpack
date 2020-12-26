#### 可以在外层定义 package, 防止内部小项目多次下载包

#### 内部的小项目就不用单独下载依赖来

# config

1、entry
2、output
3、module
4、plugin
5、devServer

# loader

## sryle-loader

## css-loader

## less-loader

## scss-loader

# plugin

### 流程分析

1、初始化参数：从配置文件和 Shell 语句中服务与合并参数，得出最终的参数
2、开始编译：用上一步得到的参数初始化 Complier 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译
3、确定入口：根据配置中的 entry 找出所有入口文件
4、编译模块：从入口文件触发，调用所有配置的 loader 对模块进行编译，再找出该模块的依赖模块，再递归本步骤知道所有入口依赖的文件都经过本步骤的处理
5、完成模块编译：经过第 4 步使用 Loader 翻译完所有模块后，得到每个模块被翻译后的最终内容以及他们之间的依赖关系
6、输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 chunk，再把每个 chunk 转换成一个单独的文件加入到输出列表(这步是可以修改输出内容的最后机会)
7、输出完成：确定号输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统

### create-react-app 脚手架分析

#### path路径  --> config/paths.js
 appDirectory 项目根目录
 resolveApp   生成绝对路径的方法
 getPublicUrlOrPath  所有资源的公共访问路径： /
 moduleFileExtensions 文件扩展名，会被react解析到
 

#### 开发环境 --> scripts/start.js


#### 生产环境 --> scripts/build.js



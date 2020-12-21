### loader --> 帮助 webpack 处理其他的非 JS 文件

1、rules 配置 loader 解析规则

- test：正则表达式 (表示匹配的文件类型)
- loader：字符串 (使用的 loader，需要下载到 node_modules , 只使用一个 loader 处理)
- use: 数组 (使用多个 loader 的情况使用 use，处理顺序从数组的右边 -> 左执行)
- options: 对象 (表示覆盖 loader 的配置， 配置内容和属性，具体看每个 loader 支持哪些配置)

```
export.exports = {
    module: {
        rules: [
            test: /\.less$/,
            use: ['style-loader', 'css-loader', 'less-loader'],
            options: {

            }
        ]
    }
}
```

#### css/less/sass 样式资源处理(目前这些都是把 css 文件添加到 html 中, 可能会导致 html 文件资源体积很大，容易导致闪屏，下方用插件来解决)

- less-loader: 将 less 文件编译为 css 文件
- css-loader: 将 css 以字符串形式编译为 commonjs 规范的 js 文件
- style-loader: 创建 style 标签，将 js 格式的 css 字符串，插入到 style 标签中

#### css 兼容性处理

- postcss-loader/postcss-preset-env: css 兼容性处理
- 需要去 package.json 中添加 browserslist,表示兼容哪些浏览器

```
<!-- options配置 -->
{
  postcssOptions: {
    plugins: [
      [
        'postcss-preset-env',
        {
          ident: 'postcss'
        }
      ]
    ]
  }
}
```

#### css 提取为单独的样式文件(需要借助 mini-css-extract-plugin 插件, 使用这个插件来替代 style-loader)

```
const MiniCssExtraPlugin = require('mini-css-extract-plugin')
<!-- loader配置 -->
{
  test: /\.css/,
  use: [
    MiniCssExtraPlugin.loader,
    'css-loader'
  ]
}
```

#### jpeg/png/svg/jpg/gif 图片资源处理(非 html 中的资源)

- file-loader: 处理图片资源（但是不能处理 html 中的图片资源
- url-loader: 内置 file-loader, 同时还有做其他工作
  (1)、limit --> 限制文件资源大小，小于 limit 的会打包为 base64
  (2)、name --> 对处理的资源进行重命名配置(.ext, 表示取的原文件后缀名)
  (3)、esModule --> 表示是否关闭 file-loader 的 es6 模块化(因为与 html-loader 会有冲突，需要改为 true, 使用 commonjs 规则)
  (4)、outputPath --> 指定输出文件存放的路径

- file-loader 与 url-loader 的区别
  (1)、url-loader, 是内置有 file-loader 模块的
  (2)、file-loader, 主要是用来解析项目中的 url 引入，不仅限于 css,能够将图片拷贝到对应的路径，根据我们的配置，修改打包后文件的引用路径，使之指向正确的文件
  (3)、url-loader 除了做 url 引入之外，还能对图片做限制，小于 limit 的图片会被转为 base64 字符串，大于 limit 的还是用 file-loader 进行路径的 copy

```
<!-- options 配置 -->
{
  limit: 8 * 1024
  name: '[hash:10].[ext]',
  esModule: true,
}
```

- html-loader: 专门处理 html 文件中的引入的图片资源等
  (1)、exclude --> 排除指定格式的文件
  (2)、注意需要将 url-loader 的 esModule 改为 true, 关闭 es6 module, 改用 commonjs 规范(否则会有冲突)

```
{
  exclude: /\.(html|js|css|less|sass)$/,
  loader: 'html-loader'
}
```

#### js 文件兼容性处理(因为低版本浏览器还不支持 ES6 规范，所以需要转为 ES5 规范)

- babel: 处理 Javascript 的编译器，把浏览器不认识的语法，编译为浏览器认识的语法
- babel-loader: 将 js 高级语法转为 es5 语法(例如 const, 箭头函数等转为 var，function 等)
- @babel/cli: babel 自带的 CLI, 可以用命令来编译文件
- @babel/core: 使用本地配置文件
- @babel/preset-env: 编译最新版 JavaScript，指示 babel 做什么样的兼容性梳理
- @babel/preset-react: 编译 react
- @babel/polyfill: 通过 polyfill 方式在目标环境中添加缺失的特性，全部编译
- core-js: 给低版本的浏览器提供接口的库, 如 Promise,map,set 等

```
<!--  配置 -->
{
  test: /\.js$/,
  loader: 'babel-laoder',
  options: {
    presets: [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corjs: {
          version: 3
        }
      }
    ]
  }
}
```

#### jsx 文件处理

### tsx 文件处理

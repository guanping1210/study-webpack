## webpack 性能优化

- 开发环境性能优化
- 生产环境性能优化

### 开发环境性能优化

- 优化打包构建速度
  - HMR
    * css: style-loader
    * js: 需要自己开启
    * html: x
- 优化代码调试
  - source-map

### 生产环境性能优化

- 优化打包构建速度
  * oneOf
  * babel缓存 --> 优化打包速度
  * 多进程打包 --> 可以针对babel-loader开启，因为babel-loader处理时间还比较厂
  * externals --> 让某些库不打包，改用 CDN 引入
  * dll --> 将node_modules中的模块打包可以分割得更细致，更小模块(但是还是会打包，不过只打包一次，而不是CDN引入)
- 优化代码运行的性能
  * 缓存(hash | chunkhash | contenthash)
  * tree shaking
  * code split --> 将nodeu_modules的库与自己写的代码分开，node_modules里面的模块全部打包到一起
  * 懒加载/预加载
  * PWA

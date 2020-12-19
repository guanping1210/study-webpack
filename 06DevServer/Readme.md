#### webpack5.0 与 webpack-dev-server3.0不兼容问题，
#### 导致npx webpack-dev-server报错
#### 命令改为 webpack server --open 能够自己启动,但是需要添加到package.json指令中

#### webpack-dev-server需要全局安装，才会有这个指令
#### 启动指令：webpack-dev-server --config webpack.config.js
但是打开的服务文件 404 (排查一下为什么404)

### webpack output 属性

1、filename，指定打包的文件名
2、path 指定打包后存放的路径(绝对路径)
3、library
4、libraryTarget
5、chunkFilename 非入口 chunk 文件的名称(但是目前还未实验成功)

```
module.exports = {
    output: {
        filename,
        path: path.resolve(__dirname, 'dist'),
    }
}
```

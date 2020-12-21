### webpack 入口属性(打包入口)

```
<!-- 单入口 SPA -->
module.exports = {
    entry: './src/index.js',
}
```

```
<!-- 多入口 MPA -->
module.exports = {
    entry: {
       home: './home.js',
       about: './about.js;
    }
}
```

```
<!-- 动态入口（不能作为打包入口） -->
module.exports = {
    entry: () => './demo',
}
```

```

```

const express = require('express')

const app = express()

//设置允许跨域访问该服务.
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Content-Type', 'application/json;charset=utf-8');
    next();
  });

app.get('/jsonp', (req, res) => {
    res.jsonp({
        name: 20,
        age: 30
    })
})

app.listen(8080, () => {
    console.log('8080端口已经开启')
})
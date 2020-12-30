const express = require("express")
const path = require('path')
const React = require('react')
const { renderToString } = require('react-dom/server')
const fs = require('fs')
const { promisify } = require('util')
const App = require('../src/App').default

const app = express()
const readFile = promisify(fs.readFile)


app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', async(req, res) => {
    const content = renderToString(<App />)
    const str = await readFile(path.resolve(__dirname, '../dist/index.html'))
    const html = str.toString().replace("<!--app-->", content)
    res.send(html)
})

app.use('/', express.static(path.resolve(__dirname, '../dist')))

app.listen(3000, () => {
    console.log('server is running...')
})













/**
 * fs.readFile 异步读取文件
 * fs.readFileSync 同步读取文件
 */
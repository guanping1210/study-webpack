import React from '../lib/React'
import ReactDOM from '../lib/ReactDOM'
import './index.css'

const { useState } = React

const Test = () => {
    return <p className="ppp">hbjhbjhbjh</p>
}

const App = () => {
    const [name, setName] = useState('hello')

    const handler = () => {
        console.log('事件打印')
    }

    return <div className="test" onClick={handler}>
        <span>hello</span>
        <Test />
        <span className="kpkpkp" onClick={() => {setName('guanping'); console.log(5555)}}>{name}</span>
    </div>
}


// 原生节点解析
// ReactDOM.render(<div className="test" onClick={() => { console.log('打印')}}>909090</div>, document.getElementById('root'))

// 函数组件
ReactDOM.render(<App />, document.getElementById('root'))
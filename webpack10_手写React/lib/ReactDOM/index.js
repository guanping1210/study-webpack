// 模拟react-dom提供的render函数
const render = (component, root) => {
    console.log('render', component, root)

    root.appendChild(component)
}


export default {
    render,
}
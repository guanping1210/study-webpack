/**
 * babel是把JSX语法糖编译为虚拟DOM，然后是createElement把虚拟DOM变为真实DOM的
 * 
 * @param {*} type 组件类型：Funcion, Class --> 都会被判定为Function + HostComponent(原生DOM)
 * @param {*} props 
 * @param {*} children 
 */
const createElement = (type, props, ...children) => {
    let element 

    const $$type = typeof type

    /**
     * function表示是函数组件或者是class组件(源码中是根据isComponent来区分func和class的)
     * 函数组件是直接调用这个函数就行了，class组件是需要new实例
     * --> 该处只针对函数组件进行处理
     */
    if($$type === 'function') {
        element = type()
    }

    // 表示是原生DOM类型,然后需要处理props和遍历children
    // 创建节点 --> 处理props属性(包括事件名、className、id等这些) --> 遍历处理children
    if($$type === 'string') {
        element = document.createElement(type)
    }

    // 统一处理props
    if(props) {
        const propKeys = Object.keys(props)
        
        // 有些特殊的事件名，从react的写法变为原生的写法是有改动的，需要特殊处理
        propKeys.forEach(key => {
            if(key === 'className') {
                element.setAttribute('class', props[key])
                return
            }

            if(key.match(/^on([\s\S]+)$/)) {
                const event = RegExp.$1.replace(/^[\s\S]/, s => s.toLocaleLowerCase())
                element.addEventListener(event, props[key])
                return
            }

            element.setAttribute(key, props[key])
        })
    }

    // 统一处理children
    insertChildren(element, children)

    return element
}

/**
 * 此处只处理了最简单的文本节点，还有嵌套的组件那些 没有处理
 * @param {*} root 
 * @param {*} children 
 */
const insertChildren = (root, children) => {
    for(let child of children) {
        if(child instanceof Array) {
            insertChildren(root, child)
        } else {
            if(typeof child === 'string') {
                child = document.createTextNode(child)
                child.innerHTML = child
            }

            root.appendChild(child)
        }
    }
}

export default createElement

/**
 * createElement思路：
 *  接收type,props,children作为参数，在调用createElement之前，babel插件已经将JSX变为了虚拟DOM。
 *  所以createElement是将虚拟DOM，也就是描述DOM节点的对象，变为真实的DOM节点
 * 
 *  处理的核心：
 *      节点类型：函数组件、class组件、以及原生DOM节点
 *      属性类型：props，也就是className,id,事件这些，在变为真实节点的属性的时候，部分属性名需要改造
 *               className --> class, onXXXX事件 -->  addEventListener(xxx, 事件)
 *      children：就是递归处理，把children追加到父级节点上
 * 
 */
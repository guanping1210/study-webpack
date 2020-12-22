import './test.css'
import './a.css'

const p = Promise.resolve()

p.then(res => {
    console.log('踩踩')
})
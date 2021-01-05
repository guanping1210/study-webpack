import Link from 'next/link'
import Router, { withRouter } from 'next/router'
import styles from '../../styles/Route.module.css'

const MyRoute = () => {
    return <div className={styles.route}>
        <h4>讲解路由</h4>
        <div>
            <Link href="./about">link跳转</Link>
        </div>
        <div>
            <span onClick={() => { Router.push('./about') }}>Router 跳转</span>
        </div>
    </div>
}

export  default MyRoute
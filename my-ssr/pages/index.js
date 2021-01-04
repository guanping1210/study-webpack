import React from 'react'
import Link from 'next/link'
import Router, { withRouter } from 'next/router'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div>
      
      <Link href="./about">about</Link>
      <button onClick={() => { Router.push('./about')}}>
        test
      </button>
    </div>
  )
}

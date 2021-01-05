import React from 'react'
import Link from 'next/link'
import Router, { withRouter } from 'next/router'

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

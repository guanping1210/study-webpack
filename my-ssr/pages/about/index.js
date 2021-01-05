import Router from 'next/router'

const About = () => {
  return <div>
    <button onClick={() => Router.back()}>返回</button>
  </div>
}

export default About
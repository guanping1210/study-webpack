### Next.js

#### Pages 页面

- 文件放在 pages 目录下,每个 page 页面都使用其文件名作为路由 pages/about.js --> /about
- 支持动态路由 pages/about/[id].js --> 通过'/about/1'访问(1 表示 ID)

#### 路由 --> 自动试别 pages 文件夹下面的文件

前提: 新建的文件,需要经过 build 打包到 server 文件下,才能访问

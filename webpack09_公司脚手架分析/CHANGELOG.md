## 5.0.4

-   修复 start 命令下静态文件无法访问问题

## [5.0.0]

-   新的构建部署文件配置，支持按分支配置和部署，详见本页`5.X 升级指南`
-   增加打包后文件的 hash，以便在文件更新后去除缓存

## 5.X 升级指南

5.X 的构建流程最大的变化是按分支来决定构建逻辑和流程，以满足产品多版本维护的需求。

在 5.X 版本中，配置内容与以前几乎无变化，在数据结构上做了些调整。

1、在 config.js 配置文件中，我们仍保留 hostCredentials、apiProxies、subApps、externalEnvironment 四个配置模块，只不过在数据结构上做了调整，按照分支对每个模块单独配置。

```javascript
//before
const hostCredentials = {
	name: 'machine-insight',
	folder: 'project-folder',
	dev: {
		host: '192.168.199.31',
		user: 'root',
		password: '123456',
		envPorts: '8087:80',
	},
	test: {
		host: '192.168.199.150',
		user: 'root',
		password: '123456',
		envPorts: '8087:80',
	},
}

const apiProxies = {
	'/apirepo/**': {
		devTarget: 'http://192.168.199.133:9001',
		testTarget: 'http://192.168.199.133:9001',
	},
	'/api/**': {
		devTarget: 'http://192.168.199.102:5555',
		testTarget: 'http://192.168.199.102:5555',
	},
}
const subApps = {
	usercenter: {
		id: 'user-center',
		routes: ['/login'],
		dev: {
			host: 'http://192.168.199.108:8088',
			version: 'dev',
		},
		test: {
			host: 'http://192.168.199.150:8088',
			version: '2.0.0',
		},
	},
}
const externalEnvironment = {
	dev: {
		name: 'cybercube',
		ssoOrigin: 'http://192.168.199.235:38092',
	},
	test: {
		name: 'tencent',
		ssoOrigin: 'http://211.159.206.244',
	},
}
//after
const configs = [
	{
		branch: '12.0.1', //
		name: 'cybercube', // 打包后的镜像名称
		folder: 'cybercube', // folder放置当前项目分支打包后文件的目录，通过此目录可以将整个项目前后端打的包放在一个文件夹下
		version: 'tem-12.0.1', // 构建的版本号，也是镜像的tag。取代原Jenkins构建页面输入的版本号
		envPort: '9999', // 启动服务的端口
		// ssh用于部署该分支的服务环境信息
		ssh: {
			host: '192.168.199.203',
			username: 'root',
			password: '654321',
		},
		// apiProxies是项目中调用后端API的开发环境和测试环境的目标地址，代理可以为地址，也可以是 proxy 对象，如果是对象，其中`target`参数为必填
		apiProxies: {
			'/apirepo/*': 'http://192.168.199.133:9001',
			'/apidatahub/*': 'http://192.168.101.151:18086',
			'/api/*': 'http://192.168.199.102:5555',
			'/hub/*': 'http://192.168.199.134:8000/hub',
			'/user/*': 'http://192.168.199.134:8000/user',
			'/repository/*': 'http://192.168.199.133:8080/repository',
			'/cybersphere/*': 'http://192.168.199.22/cybersphere',
			'/datahubset/datasetApi/**': 'http://192.168.101.151:18086',
			'/datahubset/*': 'http://192.168.101.151:17085/datahubset',
			'/datahubvisual/*': 'http://192.168.199.143:17084/datahubvisual',
			'/websocket/**': {
				secure: false,
				changeOrigin: true,
				target: 'http://192.168.199.133:9001',
				ws: true,
			},
		},
		// subApps是微前端主应用加载的所有子应用的配置
		subApps: {
			usercenter: {
				id: 'user-center',
				routes: ['/usercenter'],
				host: 'http://192.168.199.108:8088',
				version: 'dev',
			},
		},
		// `externalEnvironment`用于配置网站内置的全局变量，且这些变量来源于容易环境变量
		externalEnvironment: {
			name: 'cybercube',
			ssoOrigin: 'http://192.168.199.235:38092',
		},
	},
]
```

_注意 configs 中的数据格式，四个配置类都必须有，如果不需要可以设置为`{}`。_

2、原 devServerCustom、staticCustom 两个定义在保持原有属性上，在 devServerCustom 上新增了 branch 字段，用于指定本地启动服务时使用的分支配置。

```javascript
const devServerCustom = {
	port: 3000, // 本地启动服务的端口
	branch: '12.0.1', // 本地环境使用的分支配置，默认使用dev
}
const staticCustom = {
	publicPath: '/',
}
```

升级后，将以前固定的`dev`和`test`改为按分支单独配置，分支名称（branch）将作为匹配的依据。配置中分支命名规则：采用 Jenkins 中 BRANCH 变量匹配作为 key 的分支名作为结尾`env.JENKINSBRANCH.endsWith("config[index].branch")`。比如：Jenkins 中获取的分支名为`origin/custom-12.0.1`，config 配置中 branch 的分支取名可以为`origin/custom-12.0.1`、`custom-12.0.1`、`12.0.1`等。

3、创建 Jenkins 任务流程

new 任务 --> Copy from `build-template` --> 修改`Source Code Management`中`Repository URL` --> Save --> Build with Parameters

_在 Build with Parameters 页面，有 BRANCH 和 NOTDEPLOY 两个选项，BRANCH 是选择需要构建部署的分支，默认将部署到指定服务器，勾选 NOTDEPLOY 可以只打包镜像不进行部署。使用 deploy-image 的 Jenkins 任务可以单独执行镜像拉取和启动操作。_

## [4.2.0] - 2020-04-08

### 新功能

-   添加空值合并运算符(??)。当左侧操作数为 null 或 undefined 时，其返回右侧的操作数。否则返回左侧的操作数。与逻辑或(||)操作符不同，逻辑或会在左操作数为 假值 时返回右侧操作数。也就是说，如果你使用 || 来为某些变量设置默认的值时，你可能会遇到意料之外的行为。比如为假值(例如，'' 或 0)时。见下面的例子。

```
const foo = null ?? 'default string';
console.log(foo);
// expected output: "default string"

const baz = 0 ?? 42;
console.log(baz);
// expected output: 0
```

-   start 增加 publicPath 配置

```
添加publicPath说明
1. 升级cyber-scripts至4.2.0及以上
2. 在config.js中添加, 并导出
const staticCustom = {
	publicPath: '/cybersphere'
}
module.exports = {
	...
	staticCustom,
}

3. 在src/index.jsx增加basename
const history = createBrowserHistory({ basename: 'cybersphere' })

4. 在src/utils/api.js中请求path增加对应publicPath, 如
const _path = `/cybersphere/api${path}`
```

-   autoConfig 增加 publicPath 处理
-   build dev 版本默认设置环境为 dev
-   icon 过期时间更改为 30 天

### bugfix

-   修复 publicPath 向后兼容问题

## 4.1.8

-   增加`webpack`中`alias`的`~`配置为`node_modules`
-   修复引用低版本`cps-ui`时找不到`customName`的问题
-   升级`babel-plugin-import`至`1.13.0`版本，以支持`babel`配置的`customName`属性
-   修改 LESS 解析器为`webpack`，`less`文件引用方式为相对路径或者使用`webpack`的`alias`别名
    -   例：@import 'variables.less' 改为 @import '~src/styles/variables.less' 或 @import './variables.less'
-   该版本已包含新的 `eslint` 和引入格式化插件 `prettier`，文档待补...
-   更新母镜像 nginx 版本，修复漏洞

## 4.1.5-beta.2

-   添加 vender 的 publicPath，取值为 staticCustom.publicPath

## 4.1.4

-   修复 jenkinsfile 自动生成没有包括项目名称的 bug

## 4.1.3

-   根路由不能跳转 Hotfix

## 4.1.2

-   修复合并代码导致的 bug

## 4.1.1

-   修复自动生成 jenkinsfile 的问题

## 4.1.0

## Breaking Change

-   重构了主应用配置子应用的方式，具体参考下面的升级指南
-   通过 cyber-scripts 和总配置文件 config.js 自动生成 jenkinsfile, Dockerfile, mysite.template

## 更新

-   引入 CHANGELOG
-   引入 eslint 和 prettier
-   引入 precommit hook
-   添加 websocket 帮助函数到模板项目
-   删除无用的模板项目 cyber-react-app

## 4.X 升级指南

### 项目总配置文件

-   以前的版本针对本地开发和发布构建在 config/customConfig.js 提供了一些自定义配置的功能。比如开发环境端口配置，开发环境代理配置，是否开启 eslint-plugin-react-hooks 插件等。
-   为了体现项目总配置文件的重要性，4.x.x 版本删除了 config/customConfig.js 文件，并在项目根目录下提供 config.js 总配置文件。

### 配置 config.js

1, 配置开发环境和测试环境的环境信息

在 config.js 中定义 hostCredentials 对象，对象包含信息示例如下：

```javascript
const hostCredentials = {
	name: 'machine-insight',
	folder: 'project-folder',
	dev: {
		host: '192.168.199.31',
		user: 'root',
		password: '123456',
		envPorts: '8087:80',
	},
	test: {
		host: '192.168.199.150',
		user: 'root',
		password: '123456',
		envPorts: '8087:80',
	},
}
```

'name'是项目名称，'folder'是项目打包后的保存目录，'dev'针对开发环境，'test'针对测试环境。这里的所有信息都是必须的。

2, 配置开发环境和测试环境后端 API 的代理 apiProxies。示例如下：

```javascript
const apiProxies = {
	'/apiusercenter/*': {
		// devTarget和testTarget谁在上面，在本地开发的时候就采用谁。
		devTarget: 'http://192.168.199.31:28092',
		testTarget: 'http://192.168.199.150:28092',
	},
	'/api/*': {
		devTarget: 'http://192.168.199.31:7005',
		testTarget: 'http://192.168.199.31:7005',
	},
}
```

如果需要覆盖本地开发代理的默认配置，只需要在 testTarget 下面定义需要覆盖的配置：

```javascript
const apiProxies = {
	'/apiusercenter/*': {
		// devTarget和testTarget谁在上面，在本地开发的时候就采用谁。
		devTarget: 'http://192.168.199.31:28092',
		testTarget: 'http://192.168.199.150:28092',
		//下面的三项配置会覆盖默认的配置
		secure: true,
		changeOrigin: false,
		pathRewrite: {
			'^/apiusercenter': '',
		},
	},
}
```

2, 配置开发环境和测试环境微前端子应用 subApps。示例如下：

```javascript
const subApps = {
	usercenter: {
		id: 'user-center',
		routes: [
			'/login',
			'/resetPassword',
			'/signIn',
			'/user/list',
			'/user/add',
			'/user/edit/',
		],
		dev: {
			host: 'http://192.168.199.108:8088',
			version: 'dev',
		},
		test: {
			host: 'http://192.168.199.150:8088',
			version: '2.0.0',
		},
	},
}
```

-   这里的子应用属性名'usercenter'是子应用的名称。
-   id 值'user-center'是子应用在主应用中被加载的 div 的标识。
-   routes 是子应用在主应用中加载的路由条件。
-   dev, test 中的 host, version 对应子应用发布在开发环境和测试环境中的地址和版本号。

### 自动生成 jenkinsfile, Dockerfile 和 mysite.template

-   目前项目打包构建发布跟环境相关的一些变量，例如后端请求代理地址和子应用地址，是通过 jenkins 配置的参数通过 Docker 变量传入的。每次新增一个变量，需要在 jenkins 网页端配置页面，jenkinsfile, Dockerfile, mysite.template 四处添加配置，效率很低，同时容易出错。

-   cyber-scripts 4.x.x 通过自动生成 jenkinsfile, Dockerfile, mysite.template 的方式，如果需要新增代理配置，只需要在总配置文件 config.js 一处添加配置就行。

### 主项目针对子应用的配置

1, 删除 src/apps/apps.json 文件。

2, 将 src/apps/register.js 替换为以下内容：

```javascript
import * as singleSpa from 'single-spa'
import { pathnameStartWith, runScript, runLink, eventBus } from './utils'
import { subApps } from '../../config'

/**
 * root路径是作为主应用nginx代理请求子应用根文件index.js和index.css的拦截标志
 *
 * @param {*} appPath
 * @param {*} appId
 */
const loadApp = async (appPath, appId) => {
	try {
		await runScript(`/${appPath}/root/index.js`)
	} catch {
		console.log('加载子应用javascript文件出错。')
	}
	try {
		await runLink(`/${appPath}/root/index.css`)
	} catch {
		console.log(
			'加载子应用css文件出错。如果子应用是本地开发模式，请忽略该信息。',
		)
	}
	return window[appId]
}

/**
 * 默认的子应用加载逻辑是pathnameStartWith(app.routes)，如果子应用有自己的特殊加载逻辑，可以按照
 * 下面'user-center'子项目的方式覆盖subAppActiveFunction这个加载子项目的函数
 */
export const registerApps = () => {
	Object.keys(subApps).map((appPath) => {
		const app = subApps[appPath]
		let subAppActiveFunction = pathnameStartWith(app.routes)
		if (app.id === 'user-center') {
			subAppActiveFunction = () => {
				return (
					window.userCenterContainerExist &&
					pathnameStartWith(app.routes)
				)
			}
		}
		singleSpa.registerApplication(
			app.id,
			() => loadApp(appPath, app.id),
			subAppActiveFunction,
			{ eventBus },
		)
	})
}
```

### 子应用在 config.js 中的特殊配置

示例：

```javascript
const publicPath = 'usercenter'

// 这里的子应用是该项目自己。因为子应用需要独立在浏览器也可以加载，所以这里子应用配置自己的代理
const subApps = {
	[publicPath]: {
		dev: {
			host: 'http://192.168.199.108:8088',
			version: 'dev',
		},
		test: {
			host: 'http://192.168.199.150:8088',
			version: '2.0.0',
		},
	},
}

const staticCustom = {
	publicPath: `/${publicPath}`,
}
```

## 4.0.8

-   项目目录下静态资源目录 `static/` 新增 README.md
-   fix 因为 `context` 不同， 导致资源重复打包 update， delete `context`, use project root path

## 4.0.7

-   主目录下新增静态资源目录 `static/`
-   fix 因为 `context` 不同， 导致资源重复打包

## 4.0.5

-   添加 cyber-scripts analyse 命令，分析项目依赖包
-   添加 jsconfig.json, 支持 webpack 别名智能提示

## 4.0.4

-   babel-plugin-icon 增加缓存时间，目前配置为 1 周

## 4.0.3

-   将 babel-plugin-icon 加入到 package.json 的 files 下

## 4.0.2

-   缓存路径放到 images 目录下 src/images/**generated**

## 4.0.1

### 更新

-   新增 babel-plugin-icon 插件
-   babel.js 默认引入 babel-plugin-icon 插件

### 使用

```
// 从组件库官网查询icon名称并引入
// 自动解析名称，下载组件到src/__generated__/icons
// Native后缀不进行去色处理
import {XxxIcon, XxxIconNative} from '@cyber-insight/cps-ui/icons'

<div>
    <XxxIcon style={{fontSize: 24, color: '#333'}} />
    <XxxIconNative />
</div>
```

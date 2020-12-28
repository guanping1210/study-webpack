const {
	resolveApp,
	resolveCyberScript,
	defaultExternalEnvironment,
} = require('../config')
const {
	getCustomConfig,
	replaceStrInFile,
	copyFile,
	getPublicPath,
} = require('./utils')

function validateHostCredentials(hostCredentials) {
	const props = ['host', 'user', 'password', 'envPorts']
	// 如果hostCredentials不存在或者其中的任意一个property不存在
	/*eslint-disable */
	if (
		!hostCredentials ||
		!hostCredentials.name ||
		props.some(prop => !hostCredentials.dev[prop]) ||
		props.some(prop => !hostCredentials.test[prop])
	) {
		/*eslint-disable */
		console.error(
			'\x1b[41m%s\x1b[0m',
			'请确保config.js中的hostCredentials配置是正确的。具体请参考cyber-scripts升级到4.1.0版本指南。',
		)
		process.exit(1)
	}
}

/**
 * 从示例代理配置'/apiusercenter/*'中获取apiusercenter
 *
 * @param {*} proxyPath
 */
function getPathFromProxyPath(proxyPath) {
	return proxyPath
		.split('/')
		.filter(item => item && item !== '*' && item !== '**')
}

function autoGenerateConfigFiles() {
	try {
		const {
			apiProxies = {},
			subApps = {},
			hostCredentials,
			externalEnvironment,
		} = getCustomConfig()
		validateHostCredentials(hostCredentials)
		copyFile(
			`${resolveCyberScript('')}/Jenkinsfile`,
			`${resolveApp('')}/Jenkinsfile`,
		)
		copyFile(
			`${resolveCyberScript('')}/Dockerfile`,
			`${resolveApp('')}/Dockerfile`,
		)
		copyFile(
			`${resolveCyberScript('')}/mysite.template`,
			`${resolveApp('')}/mysite.template`,
		)
		const apiPaths = Object.keys(apiProxies).map(key => key)
		const subAppPubPaths = Object.keys(subApps).map(key => key)
		generateDocerFile(apiPaths, subAppPubPaths, externalEnvironment)
		generateJenkinsFile(
			apiPaths,
			subAppPubPaths,
			apiProxies,
			subApps,
			hostCredentials,
			externalEnvironment,
		)
		generateNginxFile(apiPaths, subAppPubPaths)
	} catch (error) {
		console.log(error)
		console.error(
			'\x1b[41m%s\x1b[0m',
			'请确保config.js中的配置是正确的。具体请参考cyber-scripts升级到4.0版本指南。',
		)
		process.exit(1)
	}
}

function generateDocerFile(apiPaths, subAppPubPaths) {
	let result = ''
	apiPaths.forEach(proxyPath => {
		const pathKeys = getPathFromProxyPath(proxyPath)
		result += `$${pathKeys[pathKeys.length - 1]} `
	})
	subAppPubPaths.forEach(path => {
		const pathKeys = getPathFromProxyPath(path)
		result += `$${pathKeys[pathKeys.length - 1]} $${
			pathKeys[pathKeys.length - 1]
		}_version `
	})

	replaceStrInFile(`${resolveApp('')}/Dockerfile`, '\\$placeholder', result)
	replaceStrInFile(
		`${resolveApp('')}/Dockerfile`,
		'\\$publicPath',
		getPublicPath(),
	)
}

function generateJenkinsFile(
	apiPaths,
	subAppPubPaths,
	apiProxies,
	subApps,
	hostCredentials,
	externalEnvironment = {},
) {
	let devProxyConfig = ''
	let testProxyConfig = ''
	const space = '            '
	/*eslint-disable */
	apiPaths.forEach(proxyPath => {
		const pathKeys = getPathFromProxyPath(proxyPath)
		const path = pathKeys[pathKeys.length - 1]
		const apiProxy = apiProxies[proxyPath]
		if (apiProxy) {
			devProxyConfig += `${space}${path}: ${apiProxy.devTarget}\n`
			testProxyConfig += `${space}${path}: ${apiProxy.testTarget}\n`
		}
	})
	subAppPubPaths.forEach(path => {
		const subApp = subApps[path]
		if (subApp) {
			devProxyConfig += `${space}${path}: ${subApp.dev.host}\n`
			devProxyConfig += `${space}${path}_version: ${subApp.dev.version}\n`
			testProxyConfig += `${space}${path}: ${subApp.test.host}\n`
			testProxyConfig += `${space}${path}_version: ${subApp.test.version}\n`
		}
	})

	// 写入external_environment的值
	const {
		dev: devExternalEnvironment = defaultExternalEnvironment,
		test: testExternalEnvironment = defaultExternalEnvironment,
	} = externalEnvironment
	devProxyConfig += `${space}external_environment: '${JSON.stringify(
		devExternalEnvironment,
	)}'\n`
	testProxyConfig += `${space}external_environment: '${JSON.stringify(
		testExternalEnvironment,
	)}'\n`

	/*eslint-disable */

	replaceStrInFile(
		`${resolveApp('')}/Jenkinsfile`,
		[
			'App_Host_Placeholder',
			'Project_Name_Placeholder',
			'Project_Folder_Placeholder',
			'Dev_Port_Placeholder',
			'Test_Port_Placeholder',
			'Dev_Proxy_Placeholder',
			'Test_Proxy_Placeholder',
		],
		[
			buildJenkinsHost(hostCredentials),
			hostCredentials.name,
			hostCredentials.folder,
			hostCredentials.dev.envPorts,
			hostCredentials.test.envPorts,
			devProxyConfig,
			testProxyConfig,
		],
	)
}

function buildJenkinsHost(hostCredentials) {
	let str = `remote.name = "${hostCredentials.name}"
    remote.host = "${hostCredentials.test.host}"
    remote.user = "${hostCredentials.test.user}"
    remote.password = "${hostCredentials.test.password}"
    remote.port = 22
    remote.allowAnyHosts = true
    if (env.VERSION == 'dev') {
        remote.host = "${hostCredentials.dev.host}"
        remote.user = "${hostCredentials.dev.user}"
        remote.password = "${hostCredentials.dev.password}"
	}`
	// 支持定制化开发分支（以custom开头命名）部署到对应custom环境
	Object.keys(hostCredentials).forEach(key => {
		if (key && key.startsWith('custom')) {
			const env = hostCredentials[key]
			str += `else if (env.VERSION == "${key}") {
				remote.host = "${env.host}"
				remote.user = "${env.user}"
				remote.password = "${env.password}"
			}`
		}
	})
	return str
}

/**
 * 在build阶段，通过jenkins拿到子应用代理的配置，然后在mysite.template里面自动生成子应用代理和普通API代理
 *
    //这是针对请求子应用根文件 index.js 和 index.css 的代理, 对应代码里的 proxyConfigIndex
    '/usercenter/index.*': {
      target: 'http://localhost:8000/1.0.0',
    },
    //这是针对请求子应用其他 js 和 css 文件的代理, 对应代码里的 proxyConfigVersion
    '/usercenter/1.0.0': {
      target: 'http://localhost:8000/1.0.0',, 对应代码里的 proxyConfig
    },
    //这是针对请求子应用静态文件的代理
    '/usercenter/*': {
      target: 'http://localhost:8000',
    }
 *
 * @param {*} subAppPubPaths
 */
function generateNginxFile(apiPaths, subAppPubPaths) {
	const proxyTemplate = `location /{publicPath}/ {
    proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_pass  {publicPathTarget}/;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_redirect off;
  }`

	let result = ''
	const publicPathKeys = getPublicPath()
		.split('/')
		.filter(key => !!key)

	apiPaths.forEach(proxyPath => {
		const pathKeys = getPathFromProxyPath(proxyPath)

		const path = `${publicPathKeys.concat(pathKeys).join('/')}`
		let proxyConfig = proxyTemplate.replace('{publicPath}', path)
		result +=
			proxyConfig.replace(
				'{publicPathTarget}',
				'${' + pathKeys[pathKeys.length - 1] + '}',
			) + '\n\n'
	})

	subAppPubPaths.forEach(path => {
		const pathKeys = getPathFromProxyPath(path)
		let proxyConfigIndex = proxyTemplate.replace(
			'{publicPath}',
			`${path}/root`,
		)
		result +=
			proxyConfigIndex.replace(
				'{publicPathTarget}',
				'${' + path + '}/${' + path + '_version}',
			) + '\n\n'

		let proxyConfigVersionDev = proxyTemplate.replace(
			'{publicPath}',
			path + '/${' + path + '_version}',
		)
		result +=
			proxyConfigVersionDev.replace(
				'{publicPathTarget}',
				'${' +
					pathKeys[pathKeys.length - 1] +
					'}/${' +
					pathKeys[pathKeys.length - 1] +
					'_version}',
			) + '\n\n'

		let proxyConfigStatic = proxyTemplate.replace('{publicPath}', path)
		result +=
			proxyConfigStatic.replace('{publicPathTarget}', '${' + path + '}') +
			'\n\n'
	})

	replaceStrInFile(
		`${resolveApp('')}/mysite.template`,
		'\\$placeholder',
		result,
	)

	replaceStrInFile(
		`${resolveApp('')}/mysite.template`,
		'\\$publicPath',
		getPublicPath(),
	)
}

module.exports = {
	autoGenerateConfigFiles,
}

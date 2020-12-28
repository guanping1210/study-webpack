const { resolveApp, resolveCyberScript } = require('../config')
const {
	getCustomConfig,
	replaceStrInFile,
	copyFile,
	getPublicPath,
	checkConfigFileValid,
} = require('./utils')

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
			hostCredentials = {},
			externalEnvironment = {},
		} = getCustomConfig()
		// validateHostCredentials(hostCredentials)
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
		generateDockerFile(apiProxies.master, subApps.master)
		generateNginxFile(apiProxies.master, subApps.master)
		generateJenkinsFile(
			apiProxies,
			subApps,
			hostCredentials,
			externalEnvironment,
		)

		if (!checkConfigFileValid(`${resolveApp('')}/Jenkinsfile`)) {
			throw new Error('生成Jenkinsfile文件有误，请检查！')
		}
		if (!checkConfigFileValid(`${resolveApp('')}/Dockerfile`)) {
			throw new Error('生成Dockerfile文件有误，请检查！')
		}
		if (!checkConfigFileValid(`${resolveApp('')}/mysite.template`)) {
			throw new Error('生成mysite.template文件有误，请检查！')
		}
	} catch (e) {
		console.error(e)
		console.error('\x1b[41m%s\x1b[0m', e.message)
		process.exit(1)
	}
}

function generateDockerFile(apiProxies = {}, subApps = {}) {
	let result = ''
	Object.keys(apiProxies).forEach(proxyPath => {
		const pathKeys = getPathFromProxyPath(proxyPath)
		result += `$${pathKeys[pathKeys.length - 1]} `
	})
	Object.keys(subApps).forEach(path => {
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
	apiProxies,
	subApps,
	hostCredentials,
	externalEnvironment,
) {
	const space = '            '
	/*eslint-disable */
	let App_Host_Placeholder = ''
	let App_Build_Placeholder = ''
	let Make_Images_Placeholder = ''
	let Deploy_Images_Placeholder = ''
	Object.keys(apiProxies).forEach(branch => {
		let proxyConfig = ''
		Object.keys(apiProxies[branch]).forEach(proxyPath => {
			const pathKeys = getPathFromProxyPath(proxyPath)
			const path = pathKeys[pathKeys.length - 1]
			const apiProxy = apiProxies[branch][proxyPath]
			if (apiProxy) {
				proxyConfig += `${space}${path}: ${apiProxy.target ||
					apiProxy}\n`
			}
		})
		Object.keys(subApps).forEach(path => {
			const subApp = subApps[path]
			if (subApp) {
				proxyConfig += `${space}${path}: ${subApp.host}\n`
				proxyConfig += `${space}${path}_version: ${subApp.version}\n`
			}
		})
		// 写入external_environment的值
		proxyConfig += `${space}external_environment: '${JSON.stringify(
			externalEnvironment,
		)}'\n`

		const _host = hostCredentials[branch] || {}
		// 生成部署环境和项目名称版本等信息
		App_Host_Placeholder += `\n	if(env.BRANCH.endsWith("${branch}")){
		remote.name = "${_host.name}"
		remote.host = "${_host.host}"
		remote.user = "${_host.user}"
		remote.password = "${_host.password}"
	}`
		// 生成构建过程的pipeline
		App_Build_Placeholder += `\n					if(env.BRANCH.endsWith("${branch}")){
						echo "\${space}\\n1、开始构建' + _host.version + '\\n\${space}"
						sh 'yarn build --env.version=${_host.version}'					
					}`
		// 生成打镜像并上传的命令
		Make_Images_Placeholder += `\n					if(env.BRANCH.endsWith("${branch}")){
						echo "\${space}\\n镜像地址：192.168.199.222/${_host.folder}/${_host.name}:${_host.version}\\n\${space}"
						sh 'cd /var/jenkins_home/workspace/\${JOB_NAME}/ && docker build -t 192.168.199.222/${_host.folder}/${_host.name}:${_host.version} . && docker push 192.168.199.222/${_host.folder}/${_host.name}:${_host.version}'
					}`
		// 拉取镜像并启动
		Deploy_Images_Placeholder += `\n						if(env.BRANCH.endsWith("${branch}")){
							echo "\${space}\\n服务部署地址：${_host.host}:${_host.envPort}\\n\${space}"
							sshCommand remote: server, command: """
cat >docker-compose-${_host.name}.yml<<EOF
#VERSION:${_host.version}
version: '3.4'
services:
	${_host.name}:
		image: 192.168.199.222/${_host.folder}/${_host.name}:${_host.version}
		restart: always
		ports:
			- ${_host.envPort}:80
		environment:
			version: ${_host.version}
${proxyConfig}
		volumes:
			- /opt/data/nginx:/opt/nginx
EOF
							"""
							sshCommand remote: server, command: """
								docker login -uadmin -p123456 192.168.199.222 && docker-compose -f docker-compose-${_host.name}.yml pull && docker-compose -f docker-compose-${_host.name}.yml up -d
							"""
						}`
	})

	/*eslint-disable */
	replaceStrInFile(
		`${resolveApp('')}/Jenkinsfile`,
		[
			'App_Host_Placeholder',
			'App_Build_Placeholder',
			'Make_Images_Placeholder',
			'Deploy_Images_Placeholder',
		],
		[
			App_Host_Placeholder,
			App_Build_Placeholder,
			Make_Images_Placeholder,
			Deploy_Images_Placeholder,
		],
	)
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
 * @param {*} subApps
 */
function generateNginxFile(apiProxies = {}, subApps = {}) {
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

	Object.keys(apiProxies).forEach(proxyPath => {
		const pathKeys = getPathFromProxyPath(proxyPath)

		const path = `${publicPathKeys.concat(pathKeys).join('/')}`
		let proxyConfig = proxyTemplate.replace('{publicPath}', path)
		result +=
			proxyConfig.replace(
				'{publicPathTarget}',
				'${' + pathKeys[pathKeys.length - 1] + '}',
			) + '\n\n'
	})

	Object.keys(subApps).forEach(path => {
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

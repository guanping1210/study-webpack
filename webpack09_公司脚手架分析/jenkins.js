const { execSync } = require('child_process')
const { Client } = require('ssh2')
const fs = require('fs')
const ssh = new Client()
const { configs, staticCustom } = require('./config.js')

const logspace = '------------------------------------------------------------'
console.log(`${logspace}\n你选择的分支：%s`, process.argv[2])
const config = configs.find(e => process.argv[2].endsWith(e.branch))
if (!config) {
	console.log(
		`${logspace}\n未找到${process.argv[2]}分支的配置！\n${logspace}`,
	)
	process.exit(1)
}
console.log('使用分支配置：')
console.dir(config)
// 解析publickPath
let publickPath = '/'
if (
	staticCustom &&
	staticCustom.publicPath &&
	staticCustom.publicPath !== '/'
) {
	// 去除首尾'/', 兼容 'publicPath', '/publicPath', '/publicPath/'
	publickPath = `/${staticCustom.publicPath
		.split('/')
		.filter(item => !!item)
		.join('/')}/`
}

function getPathFromProxyPath(proxyPath) {
	return proxyPath
		.split('/')
		.filter(item => item && item !== '*' && item !== '**')
}
function replaceStrInFile(filePath, stringsToReplace, replacements) {
	var result = fs.readFileSync(filePath, 'utf8')
	if (typeof stringsToReplace === 'string') {
		result = result.replace(new RegExp(stringsToReplace, 'g'), replacements)
	} else {
		for (let i = 0; i < stringsToReplace.length; i++) {
			result = result.replace(
				new RegExp(stringsToReplace[i], 'g'),
				replacements[i],
			)
		}
	}

	fs.writeFileSync(filePath, result, 'utf8')
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

	replaceStrInFile(`./Dockerfile`, '\\$placeholder', result)
	replaceStrInFile(`./Dockerfile`, '\\$publicPath', publickPath)
}
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
	const publicPathKeys = publickPath.split('/').filter(key => !!key)

	Object.keys(apiProxies).forEach(proxyPath => {
		const pathKeys = getPathFromProxyPath(proxyPath)

		const path = `${publicPathKeys.concat(pathKeys).join('/')}`
		const proxyConfig = proxyTemplate.replace('{publicPath}', path)
		result +=
			proxyConfig.replace(
				'{publicPathTarget}',
				'${' + pathKeys[pathKeys.length - 1] + '}',
			) + '\n\n'
	})

	Object.keys(subApps).forEach(path => {
		const pathKeys = getPathFromProxyPath(path)
		const proxyConfigIndex = proxyTemplate.replace(
			'{publicPath}',
			`${path}/root`,
		)
		result +=
			proxyConfigIndex.replace(
				'{publicPathTarget}',
				'${' + path + '}/${' + path + '_version}',
			) + '\n\n'

		const proxyConfigVersionDev = proxyTemplate.replace(
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

		const proxyConfigStatic = proxyTemplate.replace('{publicPath}', path)
		result +=
			proxyConfigStatic.replace('{publicPathTarget}', '${' + path + '}') +
			'\n\n'
	})

	replaceStrInFile(`./mysite.template`, '\\$placeholder', result)

	replaceStrInFile(`./mysite.template`, '\\$publicPath', publickPath)
}
function updateHtmlFile() {
	const _time = new Date().toLocaleString('zh-CN', {
		hour12: false,
		timeZone: 'Asia/Shanghai',
	})
	const _branch = execSync('git name-rev --name-only HEAD').toString()
	const _commit = execSync('git rev-parse --short HEAD')
	replaceStrInFile(
		`./index.html`,
		'\\<body>',
		`<body>\n<!-- ${_time} from ${_branch} : ${_commit}-->`,
	)
}
try {
	generateDockerFile(config.apiProxies, config.subApps)
	generateNginxFile(config.apiProxies, config.subApps)
	updateHtmlFile()

	const exec = command => {
		console.log(`${logspace}\nexec：%s\n${logspace}`, command)
		execSync(command, { stdio: 'inherit' })
	}
	exec(`yarn build --env.version=${config.version}`)
	exec(`docker login -uadmin -p123456 192.168.199.222`)
	// cd /var/jenkins_home/workspace/\${JOB_NAME}/ &&
	exec(
		`docker build -t 192.168.199.222/${config.folder}/${config.name}:${config.version} .`,
	)
	exec(
		`docker push 192.168.199.222/${config.folder}/${config.name}:${config.version}`,
	)
	if (process.argv[3] && process.argv[3] + '' === 'true') {
		console.log(`${logspace}\n不需要部署！\n${logspace}`)
		return false
	}
	// 生成代理规则
	let proxyConfig = ''
	const space = '            '
	Object.keys(config.apiProxies).forEach(proxyPath => {
		const pathKeys = getPathFromProxyPath(proxyPath)
		const path = pathKeys[pathKeys.length - 1]
		const apiProxy = config.apiProxies[proxyPath]
		if (apiProxy) {
			proxyConfig += `${space}${path}: ${apiProxy.target || apiProxy}\n`
		}
	})
	Object.keys(config.subApps).forEach(path => {
		const subApp = config.subApps[path]
		if (subApp) {
			proxyConfig += `${space}${path}: ${subApp.host}\n`
			proxyConfig += `${space}${path}_version: ${subApp.version}\n`
		}
	})
	// 写入external_environment的值
	proxyConfig += `${space}external_environment: '${JSON.stringify(
		config.externalEnvironment,
	)}'\n`
	// 生成yml并启动服务
	ssh.on('ready', () => {
		ssh.exec(
			`echo 'docker-compose-${config.name}.yml：' && { cat >docker-compose-${config.name}.yml<<EOF
#VERSION:${config.version}
version: '3.4'
services:
    ${config.name}:
        image: 192.168.199.222/${config.folder}/${config.name}:${config.version}
        restart: always
        ports:
            - ${config.envPort}:80
        environment:
            version: ${config.version}
${proxyConfig}
        volumes:
            - /opt/data/nginx:/opt/nginx
EOF
} && cat docker-compose-${config.name}.yml && docker login -uadmin -p123456 192.168.199.222 && docker-compose -f docker-compose-${config.name}.yml pull && docker-compose -f docker-compose-${config.name}.yml up -d`,
			(err, stream) => {
				if (err) throw err
				stream
					.on('close', () => {
						ssh.end()
					})
					.on('data', data => {
						console.log(data + '')
					})
					.stderr.on('data', data => {
						console.log(data + '')
					})
			},
		)
	}).connect({
		readyTimeout: 99999,
		...config.ssh,
	})
} catch (e) {
	console.log('error:', e)
	process.exit(1)
}

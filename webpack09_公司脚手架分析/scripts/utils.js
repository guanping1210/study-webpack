const fs = require('fs')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const {
	vendorVersion,
	vendorPath,
	resolveApp,
	isProduction,
} = require('../config')

function getAssetHtml() {
	const assets = [
		{
			filepath: require.resolve(
				`${vendorPath}/vendor${
					isProduction ? '.min' : ''
				}-${vendorVersion}.js`,
			),
			includeSourcemap: false,
			typeOfAsset: 'js',
			publicPath: getPublicPath(),
		},
	]
	return assets
}

function getDevServerCustom() {
	const customConfig = getCustomConfig()
	const {
		branch = 'dev',
		port,
		...customProps
	} = customConfig.devServerCustom
	const config = customConfig.configs.find((e) => e.branch === branch)
	if (
		!config ||
		!config.subApps ||
		!config.apiProxies ||
		!config.externalEnvironment
	) {
		console.error(
			`\x1b[41m请检查config.js中${branch}分支的配置以及apiProxies、subApps和externalEnvironment字段，配置格式请参考cyber-scripts中5.X升级指南。\x1b[0m`,
		)
		process.exit(1)
	}
	/**
	* 这里的配置是针对本地联合子应用开发的代理，以usercenter举例的配置如下
	*
	'/usercenter/root/index.*': {
	secure: false,
	changeOrigin: true,
	target: 'http://192.168.199.108:8088/dev',
	pathRewrite: { '^/usercenter': '' },
	},
	'/usercenter/dev/*': {
	secure: false,
	changeOrigin: true,
	target: 'http://192.168.199.108:8088',
	pathRewrite: { '^/usercenter': '' },
	},
	'/usercenter/*': {
	secure: false,
	changeOrigin: true,
	target: 'http://192.168.199.108:8088',
	pathRewrite: { '^/usercenter': '' },
	}
	*/
	const proxy = {}
	Object.keys(config.subApps).forEach((key) => {
		const subApp = config.subApps[key]
		const host = subApp.host
		const version = subApp.version
		proxy[`/${key}/root/index.*`] = buildProxy(`^/${key}/root`, {
			target: `${host}/${version}`,
		})
		proxy[`/${key}/${version}/**`] = buildProxy(`^/${key}`, {
			target: host,
		})
		proxy[`/${key}/**`] = buildProxy(`^/${key}`, { target: host })
	})

	Object.keys(config.apiProxies).map((path) => {
		const apiProxy = config.apiProxies[path]
		const publicPathKeys = getPublicPath()
			.split('/')
			.filter((key) => !!key)
		const pathKeys = path
			.split('/')
			.filter((item) => item && item !== '*' && item !== '**')
		const finalPath = `${publicPathKeys.concat(pathKeys).join('/')}`
		proxy[`/${finalPath}/**`] = buildProxy(
			`^/${finalPath}`,
			apiProxy.target ? apiProxy : { target: apiProxy },
		)
	})
	replaceStrInFile(
		`${resolveApp('')}/index.html`,
		'var externalEnvironment.*',
		`var externalEnvironment = '${JSON.stringify(
			config.externalEnvironment,
		)}'`,
	)
	return {
		proxy,
		...customProps,
	}
}

function getDevServerPort() {
	const customConfig = getCustomConfig()
	return customConfig.port ? customConfig.port : 3000
}

// don't separate the css due to the limit of systemjs load
function getStyleLoaders(mfeBuild) {
	return mfeBuild
		? ['css-loader']
		: [MiniCssExtractPlugin.loader, 'css-loader']
}

// as we use systemjs to load the micro-apps, we need to set the liabrary and the target
function getLibraryAndTarget(mfeBuild) {
	return mfeBuild
		? {
				library: require(`${resolveApp('')}/package.json`).name,
				libraryTarget: 'window',
		  }
		: {}
}

function isMfeBuild() {
	const { type } = require(`${resolveApp('')}/package.json`)
	return type === 'mfe'
}

// when in production mode, for micro-app build, set the mode to none
function getWebpackMode(mfeBuild) {
	if (process.env.NODE_ENV === 'development') {
		return 'development'
	} else {
		return mfeBuild ? 'none' : 'production'
	}
}

function getHooksExhauDepsLint() {
	const customConfig = getCustomConfig()
	if (customConfig && customConfig.hooksCustom) {
		return customConfig.hooksCustom.exhaustiveDeps
	}
	return true
}

function getFavicon() {
	if (fs.existsSync(`${resolveApp('')}/favicon.ico`)) {
		return './favicon.ico'
	}
	return null
}

function getPublicPath() {
	const customConfig = getCustomConfig()
	if (
		customConfig &&
		customConfig.staticCustom &&
		customConfig.staticCustom.publicPath &&
		customConfig.staticCustom.publicPath !== '/'
	) {
		// 去除首尾'/', 兼容 'publicPath', '/publicPath', '/publicPath/'
		const path = customConfig.staticCustom.publicPath
			.split('/')
			.filter((item) => !!item)
			.join('/')
		return `/${path}/`
	}
	return '/'
}

function getCustomConfig() {
	try {
		return require(`${resolveApp('')}/config.js`)
	} catch (error) {
		console.log(error)
		console.error(
			'\x1b[41m%s\x1b[0m',
			'请确保config.js配置文件存在。请参考cyber-scripts中5.X升级指南。',
		)
		process.exit(1)
	}
}

function deleteFile(path) {
	fs.unlinkSync(path, (err) => {
		if (err) {
			console.error(err)
		}
	})
}

function copyFile(source, destination) {
	fs.copyFileSync(source, destination, (err) => {
		if (err) throw err
	})
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

function checkConfigFileValid(filePath) {
	var result = fs.readFileSync(filePath, 'utf8')
	if (result.indexOf('undefined') > -1) {
		return false
	}
	return true
}

function buildProxy(path, config) {
	const tempalte = {
		secure: false,
		changeOrigin: true,
		pathRewrite: { [path]: '' },
		...config,
	}

	return JSON.parse(JSON.stringify(tempalte))
}

module.exports = {
	getAssetHtml,
	getDevServerCustom,
	getStyleLoaders,
	getLibraryAndTarget,
	isMfeBuild,
	getWebpackMode,
	getHooksExhauDepsLint,
	getFavicon,
	getDevServerPort,
	getPublicPath,
	deleteFile,
	copyFile,
	replaceStrInFile,
	getCustomConfig,
	checkConfigFileValid,
}

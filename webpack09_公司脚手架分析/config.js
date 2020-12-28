const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const CopyPlugin = require('copy-webpack-plugin')

const version = '1.0.0'
const vendorVersion = '1.0.5'
const isProduction = process.env.NODE_ENV === 'production'
const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)
const resolveCyberScript = relativePath =>
	path.resolve(
		`${appDirectory}/node_modules/@cyber-insight/cyber-scripts/`,
		relativePath,
	)
const apiServer = ['http://192.168.199.231:9002']
const distPath = resolveApp('dist')
const vendorPath = isProduction
	? resolveCyberScript(`vendor/${vendorVersion}/prod`)
	: resolveCyberScript(`vendor/${vendorVersion}/dev`)
const getVendorPath = function(isProduction) {
	return isProduction
		? resolveCyberScript(`vendor/${vendorVersion}/prod`)
		: resolveCyberScript(`vendor/${vendorVersion}/dev`)
}
const resolve = {
	extensions: ['.js', '.jsx'],
	modules: ['node_modules', resolveApp('src')],
	alias: {
		src: resolveApp('src'),
		views: resolveApp('src/views'),
		actions: resolveApp('src/actions'),
		reducers: resolveApp('src/reducers'),
		components: resolveApp('src/components'),
		utils: resolveApp('src/utils'),
		common: resolveApp('src/common'),
		pages: resolveApp('src/pages'),
		constants: resolveApp('src/constants'),
		config: resolveApp('src/config'),
		'~': resolveApp('node_modules'),
	},
}

const plugins = [
	// 定义常量
	new webpack.DefinePlugin({
		__PROD__: isProduction,
		'process.env.NODE_ENV': JSON.stringify(
			process.env.NODE_ENV || 'development',
		),
	}),
	new webpack.ProvidePlugin({
		React: 'react',
		PropTypes: 'prop-types',
		Axios: 'axios',
		ReactDom: 'react-dom',
		ReactRedux: 'react-redux',
		ReactRouterDom: 'react-router-dom',
		ConnectedReactRouter: 'connected-react-router',
		Redux: 'redux',
		ReduxActions: 'redux-actions',
		ReduxPromise: 'redux-promise',
		History: 'history',
		classNames: 'classnames',
		moment: 'moment',
	}),
	new CopyPlugin([
		{ from: resolveApp('static'), to: 'static/', toType: 'dir' },
	]),
]

// 默认外部变量的值
const defaultExternalEnvironment = { ssoOrigin: 'http://192.168.199.235:38092' }

module.exports = {
	isProduction,
	apiServer,
	version,
	vendorVersion,
	getVendorPath,
	distPath,
	resolve,
	plugins,
	vendorPath,
	resolveApp,
	resolveCyberScript,
	defaultExternalEnvironment,
}

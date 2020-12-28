let customName = require('path').resolve(
	'./node_modules/@cyber-insight/cps-ui/customName.js',
)
if (!require('fs').existsSync(customName)) {
	customName = undefined
}
module.exports = {
	presets: [
		[
			'@babel/env',
			{
				modules: 'commonjs',
				targets: {
					browsers: [],
				},
				useBuiltIns: 'usage',
				debug: false,
				corejs: 2,
			},
		],
		'@babel/preset-react',
	],
	plugins: [
		'react-hot-loader/babel',
		'@babel/plugin-transform-runtime',
		'@babel/plugin-proposal-class-properties',
		'@babel/plugin-syntax-dynamic-import',
		'@babel/plugin-proposal-object-rest-spread',
		'@babel/plugin-proposal-optional-chaining',
		'@babel/plugin-proposal-nullish-coalescing-operator',
		['import', { libraryName: 'antd', style: false }, 'antd'],
		[
			'import',
			{
				libraryName: '@cyber-insight/cps-ui',
				style: path => {
					let _path = `${path}/style/index.js`
					if (
						!require('fs').existsSync(
							require('path').resolve('node_modules', _path),
						)
					) {
						_path = undefined
					}
					return _path
				},
				customName,
			},
		],
		[
			'import',
			{
				libraryName: 'lodash',
				libraryDirectory: '',
				camel2DashComponentName: false,
			},
			'lodash',
		],
		[
			'../babel-plugin-icon/plugin',
			{
				libraryName: '@cyber-insight/cps-ui/icons',
				cacheDir: './src/images/__generated__',
				cacheExpired: 30 * 24 * 60 * 60 * 1000, // 过期时间30天
				iconServer: 'http://192.168.199.203:5101/component',
			},
		],
	],
}

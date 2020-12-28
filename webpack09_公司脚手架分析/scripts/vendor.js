const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const path = require('path')

const { vendorVersion, resolveApp, isProduction } = require('../config')
const vendor = [
	'react',
	'axios',
	'react-dom',
	'react-redux',
	'react-router-dom',
	'connected-react-router',
	'redux',
	'redux-actions',
	'redux-promise',
	'classnames',
	'history',
	'moment',
	// 'rc-form',
	'prop-types',
]
const resolve = {
	extensions: ['.js', '.jsx', '.less'],
	modules: ['node_modules', resolveApp('src')],
	alias: {
		src: resolveApp('src'),
	},
}
const vendorPath = isProduction
	? path.resolve(`vendor/${vendorVersion}/prod`)
	: path.resolve(`vendor/${vendorVersion}/dev`)
if (isProduction) {
	module.exports = {
		mode: process.env.NODE_ENV,
		output: {
			path: vendorPath,
			filename: `[name].min-${vendorVersion}.js`,
			library: '[name]_min',
		},
		performance: {
			hints: false,
		},
		entry: {
			vendor,
		},
		plugins: [
			new webpack.DllPlugin({
				path: `${vendorPath}/manifest.min-${vendorVersion}.json`,
				name: '[name]_min',
			}),
			new MiniCssExtractPlugin({
				filename: `${vendorPath}/[name].min-${vendorVersion}.css`,
			}),
			new ParallelUglifyPlugin({
				uglifyES: {
					output: {
						beautify: false, // 最紧凑的输出
					},
					compress: {
						// 在UglifyJs删除没有用到的代码时不输出警告
						// warnings: false,
						// 删除所有的 `console` 语句
						// 还可以兼容ie浏览器
						drop_console: true,
						// 内嵌定义了但是只用到一次的变量
						collapse_vars: true,
						// 提取出出现多次但是没有定义成变量去引用的静态值
						reduce_vars: true,
					},
				},
			}),
		],
		resolve,
		module: {
			rules: [
				{
					test: /\.js$/,
					include: /(src)/,
					use: 'babel-loader',
				},
				{
					test: /\.(less|css)$/,
					use: [
						MiniCssExtractPlugin.loader,
						'css-loader',
						'less-loader',
					],
				},
				{
					test: /\.(jpg|jpeg|gif|png)$/,
					use: {
						loader: 'url-loader',
						options: {
							limit: 10000,
							publicPath: '',
							name: 'images/[name].[ext]',
						},
					},
				},
				{
					test: /\.(eot|ttf|woff|svg|woff2)$/,
					use: {
						loader: 'url-loader',
						options: {
							limit: 10000,
							publicPath: '',
							name: 'fonts/[name].[ext]',
						},
					},
				},
			],
		},
	}
} else {
	module.exports = {
		mode: 'development',
		devtool: '#cheap-eval-source-map',
		output: {
			path: vendorPath,
			filename: `[name]-${vendorVersion}.js`,
			library: '[name]',
		},
		entry: {
			vendor,
		},
		plugins: [
			new webpack.DllPlugin({
				path: `${vendorPath}/manifest-${vendorVersion}.json`,
				name: '[name]',
			}),
		],
		resolve,
		module: {
			rules: [
				{
					test: /\.js$/,
					include: /(src)/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: [
								[
									'es2015',
									{
										modules: false,
									},
								],
								'stage-0',
								'react',
							],
						},
					},
				},
				{
					test: /\.less$/,
					exclude: /(bootstrap)/,
					use: [
						{
							loader: 'style-loader',
						},
						{
							loader: 'css-loader',
							options: {
								autoprefixer: false,
								minimize: false,
								sourceMap: false,
								modules: true,
								importLoaders: 1,
								localIdentName: '[local]__[hash:base64:5]',
							},
						},
						{
							loader: 'postcss-loader',
							options: {
								ident: 'postcss',
							},
						},
						{
							loader: 'less-loader',
						},
					],
				},
				{
					test: /\.(jpg|jpeg|gif|png)$/,
					use: {
						loader: 'url-loader',
						options: {
							limit: 10000000,
						},
					},
				},
				{
					test: /\.(eot|ttf|woff|svg|woff2)$/,
					use: {
						loader: 'url-loader',
						options: {
							limit: 10000000,
						},
					},
				},
			],
		},
	}
}

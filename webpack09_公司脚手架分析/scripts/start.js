const webpack = require('webpack')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {
	version,
	vendorVersion,
	resolve,
	plugins,
	vendorPath,
	resolveApp,
} = require('../config')
const {
	getAssetHtml,
	getDevServerCustom,
	getLibraryAndTarget,
	isMfeBuild,
	getFavicon,
	getPublicPath,
} = require('./utils')

const host = '0.0.0.0'
const compilationSuccessInfo = [
	`You application is running at http://localhost:${process.env.PORT}`,
]

const mfeBuild = isMfeBuild()

plugins.push(
	new webpack.HotModuleReplacementPlugin(),
	new FriendlyErrorsWebpackPlugin({
		compilationSuccessInfo: {
			messages: compilationSuccessInfo,
		},
		onErrors: (severity, errors) => {
			if (severity !== 'error') {
				return
			}
			const error = errors[0]
			console.log('error message:', error.message)
		},
		clearConsole: true,
	}),
	new HtmlWebpackPlugin({
		chunks: ['common', 'index'],
		chunksSortMode: 'dependency',
		template: 'index.html',
		filename: `${version}/index.html`,
		favicon: getFavicon(),
	}),
	new AddAssetHtmlPlugin(getAssetHtml()),
	new webpack.ProvidePlugin({
		Promise: 'es6-promise-promise',
	}),
)

if (mfeBuild) {
	// 子项目打包成一个js文件
	plugins.push(
		new webpack.optimize.LimitChunkCountPlugin({
			maxChunks: 1,
		}),
	)
} else {
	plugins.push(
		new webpack.DllReferencePlugin({
			manifest: require(`${vendorPath}/manifest-${vendorVersion}.json`),
		}),
	)
}

module.exports = {
	mode: 'development',
	devtool: '#cheap-module-eval-source-map',
	watch: true,
	watchOptions: {
		poll: true,
		ignored: /node_modules/,
	},
	cache: true,
	entry: {
		index: [
			'react-hot-loader/patch',
			`webpack-dev-server/client?http://localhost:${process.env.PORT}`,
			'webpack/hot/only-dev-server',
			resolveApp('src'),
		],
	},
	plugins,
	output: {
		path: resolveApp('dist'),
		filename: `${version}/[name].js`,
		publicPath: `${getPublicPath()}`,
		...getLibraryAndTarget(mfeBuild),
	},
	resolve,
	devServer: {
		host,
		port: process.env.PORT,
		publicPath: getPublicPath(),
		contentBase: resolveApp('dist'), // hotfix, use dist, can not get asset at `/static/` folder
		quiet: true,
		hot: true,
		disableHostCheck: true,
		stats: 'errors-only',
		historyApiFallback: {
			index: `${getPublicPath()}${version}/index.html`,
		},
		...getDevServerCustom(),
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				include: /(src|config.js)/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							cacheDirectory: true,
							plugins: ['react-hot-loader/babel'],
						},
					},
				],
			},
			{
				test: /\.(css|less)$/,
				use: [
					{
						loader: 'style-loader',
					},
					{
						loader: 'css-loader',
					},
					{
						loader: 'postcss-loader',
						options: {
							ident: 'postcss',
							plugins: [require('autoprefixer')],
						},
					},
					{
						loader: 'less-loader',
						options: {
							// cps-ui需要使用webpack的less resolver解析，使用style-resources-loader解决less全局变量的问题
							javascriptEnabled: true,
						},
					},
					/**	此插件会影响构建效率，暂删除。less文件引用方式为相对路径或者使用webpack的alias别名
					 *  例：@import 'variables.less' 改为 @import '~src/styles/variables.less' 或 @import './variables.less'
					 */
					// {
					// 	loader: 'style-resources-loader',
					// 	options: {
					// 		patterns: resolveApp('src/styles/*.less'),
					// 	},
					// },
				],
			},
			{
				test: /\.svg$/,
				exclude: /node_modules\//,
				issuer: {
					test: /\.jsx?$/,
				},
				use: [
					'babel-loader',
					{
						loader: '@svgr/webpack',
						options: {
							babel: false,
							icon: true,
							titleProp: 'title',
						},
					},
				],
			},
			{
				test: /\.(jpg|jpeg|gif|png)$/,
				use: {
					loader: 'url-loader',
					options: {
						publicPath: getPublicPath(),
						limit: 10000000,
					},
				},
			},
			{
				test: /\.(eot|ttf|woff|svg|woff2)$/,
				use: {
					loader: 'url-loader',
					options: {
						publicPath: getPublicPath(),
						limit: 10000000,
					},
				},
			},
		],
	},
}

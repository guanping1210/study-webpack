const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
	.BundleAnalyzerPlugin
const {
	version,
	vendorVersion,
	resolve,
	plugins,
	vendorPath,
	isProduction,
	resolveApp,
} = require('../config')
const {
	getAssetHtml,
	getLibraryAndTarget,
	isMfeBuild,
	getWebpackMode,
	getFavicon,
	getPublicPath,
} = require('./utils')

module.exports = function(env) {
	const mfeBuild = isMfeBuild()
	const appVersion = env && env.version ? env.version : version
	console.log('构建版本：', appVersion)
	plugins.push(
		new CleanWebpackPlugin(resolveApp('dist'), {
			root: resolveApp(''),
		}),
		new ParallelUglifyPlugin({
			uglifyES: {
				// 最紧凑的输出
				output: {
					// beautify: false
				},
				// 删除所有的注释
				// comments: false, //default false
				compress: {
					// 在UglifyJs删除没有用到的代码时不输出警告
					// warnings: false, //默认
					// 删除所有的 `console` 语句
					// 还可以兼容ie浏览器
					drop_console: isProduction,
					// 内嵌定义了但是只用到一次的变量
					collapse_vars: true,
					// 提取出出现多次但是没有定义成变量去引用的静态值
					reduce_vars: true,
					/* 默认true，置为false以解决在引用react-draft-wysiwyg库时会误删除导出包名的定义,
					 * 导致react报错：TypeError: Super expression must either be null or a function, not undefined
					 * 预计将会导致打包后的js文件大小增加大约0.17127% 。by: yj.wang */
					unused: false,
				},
			},
		}),
		new HtmlWebpackPlugin({
			chunks: ['common', 'index'],
			chunksSortMode: 'dependency',
			template: 'index.html',
			filename: `${appVersion}/index.html`,
			favicon: getFavicon(),
			hash: true,
		}),
		new AddAssetHtmlPlugin(getAssetHtml()),
		new webpack.ProvidePlugin({
			Promise: 'es6-promise-promise',
		}),
		new MiniCssExtractPlugin({
			filename: `${appVersion}/[name].css`,
			chunkFilename: `${appVersion}/[name].chunk.css?[chunkhash:8]`,
		}),
		new OptimizeCSSAssetsPlugin({
			assetNameRegExp: /\.(less|css)\.*(?!.*map)/g, // 注意不要写成 /\.css$/g
			cssProcessor: require('cssnano'),
			cssProcessorOptions: {
				discardComments: {
					removeAll: true,
				},
				// 避免 cssnano 重新计算 z-index
				safe: true,
				// cssnano 集成了autoprefixer的功能
				// 会使用到autoprefixer进行无关前缀的清理
				// 关闭autoprefixer功能
				// 使用postcss的autoprefixer功能
				autoprefixer: false,
			},
			canPrint: true,
		}),
	)

	// 只有主项目引用vendor, 子项目共享主项目的vendor
	// TODO: 如果子项目使用主项目vendor有冲突，考虑更好的方法
	if (!mfeBuild) {
		plugins.push(
			new webpack.DllReferencePlugin({
				manifest: require(`${vendorPath}/manifest${
					isProduction ? '.min' : ''
				}-${vendorVersion}.json`),
			}),
		)
	}

	// 分析依赖包
	if (process.env.ANALYSE === 'true') {
		plugins.push(new BundleAnalyzerPlugin())
	}

	return {
		mode: getWebpackMode(mfeBuild),
		entry: {
			index: [resolveApp('./src')],
		},
		performance: {
			hints: false,
		},
		plugins,
		output: {
			path: resolveApp('./dist'),
			filename: `${appVersion}/[name].js`,
			chunkFilename: `${appVersion}/[name].chunk.js?[chunkhash:8]`,
			publicPath: `${getPublicPath()}`,
			...getLibraryAndTarget(mfeBuild),
		},
		stats: {
			colors: true,
			children: false,
		},
		resolve,
		optimization: {
			// runtimeChunk: {
			//     name: "manifest"
			// },
			splitChunks: {
				chunks: 'all',
				minSize: 30000,
				minChunks: 2,
				name: 'common',
			},
			// @TODO 因为组件库带来bug, 所以先把合并 modules 关闭
			concatenateModules: false,
		},
		module: {
			rules: [
				{
					test: /\.(js|jsx)$/,
					include: /(src|config.js)/,
					use: ['babel-loader'],
				},
				{
					test: /\.(css|less)$/,
					use: [
						MiniCssExtractPlugin.loader,
						'css-loader',
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
					test: /\.(jpg|jpeg|gif|png|svg)$/,
					loader: 'url-loader',
					options: {
						limit: 10000,
						publicPath: getPublicPath(),
						name: 'static/images/[name].[ext]?[hash:8]',
					},
				},
				{
					test: /\.(eot|ttf|woff|woff2)$/,
					loader: 'url-loader',
					options: {
						limit: 10000,
						publicPath: getPublicPath(),
						name: 'static/fonts/[name].[ext]',
					},
				},
			],
		},
	}
}

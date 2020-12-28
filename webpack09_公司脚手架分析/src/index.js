#!/usr/bin/env node

import commander from 'commander'
import spawn from 'cross-spawn'
import packageJson from '../package.json'
import { resolveApp } from '../config'
import { getDevServerPort } from '../scripts/utils'
import { autoGenerateConfigFiles } from '../scripts/copy'
import { createProject } from './create-cyber-app'

const program = new commander.Command()

program.version(packageJson.version, '-v, --version')

program
	.command('start')
	.description('启动开发环境')
	.action(runStart)

program
	.command('build')
	.description('构建项目')
	.option('-d, --dev', '开发模式')
	.option('--env.version <appVersion>', '应用版本号')
	.option('--env.subApps <subApps>', '子应用注册')
	.action(runBuild)

program
	.command('analyse')
	.description('分析项目依赖')
	.action(runAnalyse)

program
	.command('autoConfig')
	.description('自动生成jenkins, dockerfile和mysite.template文件')
	.action(runAutoConfig)

program
	.command('lint')
	.description('代码检查')
	.action(runLint)

program
	.command('format')
	.description('代码格式化')
	.action(runFormat)

program
	.command('create <projectName>')
	.description('创建新项目')
	.option('-s, --sub', '创建微服务子应用模板项目')
	.action(function(projectName, options) {
		createProject(projectName, options.sub)
	})

program.parse(process.argv)

function runStart() {
	const portfinder = require('portfinder')
	portfinder.basePort = getDevServerPort()
	portfinder
		.getPortPromise()
		.then(port => {
			process.env.PORT = port

			const projectPath = `${process.cwd()}/node_modules`
			spawn.sync(
				'cross-env',
				[
					'NODE_ENV=development',
					`${projectPath}/webpack-dev-server/bin/webpack-dev-server.js`,
					'--config',
					require.resolve('../scripts/start.js'),
					'--progress',
				],
				{
					stdio: 'inherit',
				},
			)
		})
		.catch()
}

function runBuild(options) {
	const projectPath = `${process.cwd()}/node_modules`

	//   buildVendorIfNotExist(projectPath, !options.dev)
	const args = [
		`NODE_ENV=${
			options.dev || options['env.version'] === 'dev'
				? 'development'
				: 'production'
		}`,
		`${projectPath}/webpack/bin/webpack.js`,
		'--config',
		require.resolve('../scripts/build.js'),
	]
	if (options['env.version']) {
		args.push(`--env.version=${options['env.version']}`)
	}
	if (options['env.subApps']) {
		args.push(`--env.subApps=${options['env.subApps']}`)
	}
	spawn.sync('cross-env', args, {
		stdio: 'inherit',
	})
}

function runAnalyse() {
	const projectPath = `${process.cwd()}/node_modules`
	const args = [
		'ANALYSE=true',
		'NODE_ENV=production',
		`${projectPath}/webpack/bin/webpack.js`,
		'--config',
		require.resolve('../scripts/build.js'),
	]
	spawn.sync('cross-env', args, {
		stdio: 'inherit',
	})
}

function runLint() {
	const projectPath = `${process.cwd()}/node_modules`

	spawn.sync(
		`${projectPath}/.bin/eslint`,
		['--ext', '.js', '--ext', '.jsx', resolveApp('src')],
		{
			stdio: 'inherit',
		},
	)
}

function runFormat() {
	const projectPath = `${process.cwd()}/node_modules`

	spawn.sync(
		`${projectPath}/.bin/prettier`,
		['--write', 'src/**/*.{js,jsx}'],
		{
			stdio: 'inherit',
		},
	)
}

function runAutoConfig() {
	autoGenerateConfigFiles()
}

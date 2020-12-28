import fs from 'fs-extra'
import chalk from 'chalk'
import path from 'path'
import getNpmPackageVersion from 'get-npm-package-version'
import { ncp } from 'ncp'
import { resolveApp } from '../config'
import packageJson from '../package.json'

ncp.limit = 16
process.stdin.setEncoding('utf8')

export function createProject(projectName, isSub) {
	updateWarning()
	checkProjectExist(projectName)
	const templateName = isSub ? 'cyber-react-mfe-sub' : 'cyber-react-mfe-main'
	const cyberScriptsPath = path.resolve(__dirname, '..')
	cloneTemplate(
		`${cyberScriptsPath}/templates/${templateName}`,
		resolveApp(projectName),
	)
}

function checkProjectExist(projectName) {
	if (fs.existsSync(resolveApp(projectName))) {
		console.log(
			`${chalk.yellow(
				`${chalk.blue(projectName)} 已经存在于当前目录。`,
			)}`,
		)
		process.exit(1)
	}
}

function cloneTemplate(source, dest) {
	ncp(source, dest, function(err) {
		if (err) {
			return console.error(err)
		}
		console.log(chalk.yellow('项目初始化完成。'))
	})
}

function updateWarning() {
	const lastestVersion = getNpmPackageVersion('@cyber-insight/cyber-scripts')
	if (lastestVersion !== packageJson.version) {
		console.log(
			`${chalk.blue('@cyber-insight/cyber-scripts')} 当前版本为 ${
				packageJson.version
			}`,
		)
		console.log(
			`${chalk.blue(
				'@cyber-insight/cyber-scripts',
			)} 有最新版本 ${chalk.yellow(lastestVersion)} 请及时更新!`,
		)
		process.exit(1)
	}
}

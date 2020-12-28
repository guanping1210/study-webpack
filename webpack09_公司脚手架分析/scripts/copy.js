const { resolveApp, resolveCyberScript } = require('../config')
const { copyFile } = require('./utils')

// 将构建部署配置复制到目标工程根目录下
function autoGenerateConfigFiles() {
	try {
		copyFile(
			`${resolveCyberScript('')}/jenkins.js`,
			`${resolveApp('')}/jenkins.js`,
		)
		copyFile(
			`${resolveCyberScript('')}/Dockerfile`,
			`${resolveApp('')}/Dockerfile`,
		)
		copyFile(
			`${resolveCyberScript('')}/mysite.template`,
			`${resolveApp('')}/mysite.template`,
		)
	} catch (e) {
		console.error(e)
		console.error('\x1b[41m%s\x1b[0m', e.message)
		process.exit(1)
	}
}

module.exports = {
	autoGenerateConfigFiles,
}

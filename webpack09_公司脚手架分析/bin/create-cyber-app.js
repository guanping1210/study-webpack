"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createProject = createProject;

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _chalk = _interopRequireDefault(require("chalk"));

var _path = _interopRequireDefault(require("path"));

var _getNpmPackageVersion = _interopRequireDefault(require("get-npm-package-version"));

var _ncp = require("ncp");

var _config = require("../config");

var _package = _interopRequireDefault(require("../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_ncp.ncp.limit = 16;
process.stdin.setEncoding('utf8');

function createProject(projectName, isSub) {
  updateWarning();
  checkProjectExist(projectName);
  const templateName = isSub ? 'cyber-react-mfe-sub' : 'cyber-react-mfe-main';

  const cyberScriptsPath = _path.default.resolve(__dirname, '..');

  cloneTemplate(`${cyberScriptsPath}/templates/${templateName}`, (0, _config.resolveApp)(projectName));
}

function checkProjectExist(projectName) {
  if (_fsExtra.default.existsSync((0, _config.resolveApp)(projectName))) {
    console.log(`${_chalk.default.yellow(`${_chalk.default.blue(projectName)} 已经存在于当前目录。`)}`);
    process.exit(1);
  }
}

function cloneTemplate(source, dest) {
  (0, _ncp.ncp)(source, dest, function (err) {
    if (err) {
      return console.error(err);
    }

    console.log(_chalk.default.yellow('项目初始化完成。'));
  });
}

function updateWarning() {
  const lastestVersion = (0, _getNpmPackageVersion.default)('@cyber-insight/cyber-scripts');

  if (lastestVersion !== _package.default.version) {
    console.log(`${_chalk.default.blue('@cyber-insight/cyber-scripts')} 当前版本为 ${_package.default.version}`);
    console.log(`${_chalk.default.blue('@cyber-insight/cyber-scripts')} 有最新版本 ${_chalk.default.yellow(lastestVersion)} 请及时更新!`);
    process.exit(1);
  }
}
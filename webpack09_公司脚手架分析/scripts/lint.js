// http://eslint.org/docs/user-guide/configuring

const { getHooksExhauDepsLint } = require('./utils')

const rules = {
	'react/prop-types': [0],
	'react-hooks/rules-of-hooks': 'error',
	'prefer-promise-reject-errors': [0],
	'react/jsx-fragments': [0],
	'react/display-name': [0], // 允许匿名类
	'standard/no-callback-literal': [0], // 允许在callback中使用所有类型参数
	'react/jsx-no-undef': [2, { allowGlobals: true }], // 允许从global scope中查找全局组件定义，jsx文件不需要引用React、ReactDom、moment等
}

function getRules() {
	if (getHooksExhauDepsLint()) {
		rules['react-hooks/exhaustive-deps'] = 'warn'
	}
	return rules
}

module.exports = {
	root: true,
	parser: 'babel-eslint', // 解析器，这里我们使用babel-eslint
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module', // 类型为module，因为代码使用了使用了ECMAScript模块
		ecmaFeatures: {
			jsx: true,
		},
	},
	env: {
		browser: true, // 预定义的全局变量，这里是浏览器环境
		commonjs: true,
		es6: true,
		node: true,
		jest: true,
	},
	extends: [
		'standard',
		'eslint:recommended',
		'plugin:react/recommended',
		'prettier',
	],
	plugins: ['react', 'react-hooks', 'prettier'],
	globals: {
		// 以下变量已在webpack中提供
		React: 'readonly',
		__PROD__: 'readonly',
		__DEV__: 'readonly',
		__TEST__: 'readonly',
		PropTypes: 'readonly',
		Axios: 'readonly',
		ReactDom: 'readonly',
		ReactRedux: 'readonly',
		ReactRouterDom: 'readonly',
		ConnectedReactRouter: 'readonly',
		Redux: 'readonly',
		ReduxActions: 'readonly',
		ReduxPromise: 'readonly',
		History: 'readonly',
		classNames: 'readonly',
		moment: 'readonly',
	},
	settings: {
		react: {
			version: 'detect',
		},
	},
	rules: getRules(),
}

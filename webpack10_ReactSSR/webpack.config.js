const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: [
                        "@babel/preset-env",
                        "@babel/preset-react",
                        {
                            useBuiltIns: 'usage',
                            corjs: { version: 3 }
                        }
                    ]
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', 'jsx']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new CleanWebpackPlugin()
    ]
}

/**
 * http://blog.poetries.top/2018/11/18/react-ssr/?utm_source=tuicool&utm_medium=referral
 */
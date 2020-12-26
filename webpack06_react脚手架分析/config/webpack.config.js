'use strict';
// 正儿八经的webpack配置
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const resolve = require('resolve');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const ManifestPlugin = require('webpack-manifest-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const paths = require('./paths');
const modules = require('./modules');
const getClientEnvironment = require('./env');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');

const postcssNormalize = require('postcss-normalize');

const appPackageJson = require(paths.appPackageJson);
// 决定是否生成source-map文件
// 修改的话，可以用cross-env来修改
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
// 是否内联runtime文件
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== 'false';

// 内联图片的限制大小 10000 ，差不多是10KB
// 最小转化base64的图片的大小
const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
);
// 是否启用ts
const useTypeScript = fs.existsSync(paths.appTsConfig);

// 样式文件的正则
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

// 生成最终webpack开发或生产环境配置的函数
// 接收一个环境变量的参数
module.exports = function(webpackEnv) {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';

  const isEnvProductionProfile =
    isEnvProduction && process.argv.includes('--profile');

  // 获取环境变量的方法
  // 加载 .env 文件的环境变量：必须是以REACT_APP 开头
  const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

  // 处理样式文件loader的配置
  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isEnvDevelopment && require.resolve('style-loader'),
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        options: paths.publicUrlOrPath.startsWith('.')
          ? { publicPath: '../../' }
          : {},
      },
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          ident: 'postcss',
          plugins: () => [
            require('postcss-flexbugs-fixes'),
            require('postcss-preset-env')({
              autoprefixer: {
                flexbox: 'no-2009',
              },
              stage: 3,
            }),
            // rest css 样式重制
            postcssNormalize(),
          ],
          sourceMap: isEnvProduction && shouldUseSourceMap,
        },
      },
    ].filter(Boolean);
    if (preProcessor) {
      loaders.push(
        {
          loader: require.resolve('resolve-url-loader'),
          options: {
            sourceMap: isEnvProduction && shouldUseSourceMap,
          },
        },
        {
          loader: require.resolve(preProcessor),
          options: {
            sourceMap: true,
          },
        }
      );
    }
    return loaders;
  };

  // webpack配置对象
  return {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    // 是否需要立即停止打包(生产环境遇到错误需要立即停止)
    bail: isEnvProduction,

    // 判断devtool用哪一种source-map
    // source-map用于生产环境
    // cheap-module-source-map用于开发环境
    devtool: isEnvProduction
      ? shouldUseSourceMap
        ? 'source-map'
        : false
      : isEnvDevelopment && 'cheap-module-source-map',
    // 入口配置
    // 开发环境要加HMR功能，生产环境则不需要
    entry: [
      isEnvDevelopment &&
        require.resolve('react-dev-utils/webpackHotDevClient'),
      paths.appIndexJs,
    ].filter(Boolean),
    // 出口配置
    output: {
      path: isEnvProduction ? paths.appBuild : undefined,
      // 添加 /* filename */ 注释到输出的文件中
      pathinfo: isEnvDevelopment,
      // 输出的文件名
      filename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].js'
        : isEnvDevelopment && 'static/js/bundle.js',
      // 未来版本的一些emit
      futureEmitAssets: true,
      // 代码分割出来的文件的命名
      chunkFilename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : isEnvDevelopment && 'static/js/[name].chunk.js',
      // 公共路径，默认是 ./，可以通过package.json中的homepage来修改
      publicPath: paths.publicUrlOrPath,
      // 开发环境的source-map的文件名和文件路径
      // 防止冲突
      devtoolModuleFilenameTemplate: isEnvProduction
        ? info =>
            path
              .relative(paths.appSrc, info.absoluteResourcePath)
              .replace(/\\/g, '/')
        : isEnvDevelopment &&
          (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
      // 
      jsonpFunction: `webpackJsonp${appPackageJson.name}`,
      // 全局变量 this --> window/global
      globalObject: 'this',
    },
    // webpack 优化压缩的配置
    optimization: {
      // 只有生产环境才启用压缩
      minimize: isEnvProduction,
      minimizer: [
        // TerserPlugin 替代以前的 uglyfiy 压缩
        // 压缩js
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              
              comparisons: false,
              
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            keep_classnames: isEnvProductionProfile,
            keep_fnames: isEnvProductionProfile,
            output: {
              ecma: 5,
              comments: false,
              
              ascii_only: true,
            },
          },
          sourceMap: shouldUseSourceMap,
        }),
        // 压缩 css
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            parser: safePostCssParser,
            map: shouldUseSourceMap
              ? {
             
                  inline: false,
                  
                  annotation: true,
                }
              : false,
          },
          cssProcessorPluginOptions: {
            preset: ['default', { minifyFontValues: { removeQuotes: false } }],
          },
        }),
      ],
      // 代码分割
      splitChunks: {
        chunks: 'all',
        name: false,
      },
      // 单独提取依赖文件的hash到一个独立的文件中
      // 文件更新时，只更新当前文件和runtime文件
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`,
      },
    },
    // 解析的规则
    resolve: {
      // 定义解析的范围，能够减少查找解析的时间
      modules: ['node_modules', paths.appNodeModules].concat(
        modules.additionalModulePaths || []
      ),
      // 文件扩展名 --> 来自于paths文件
      extensions: paths.moduleFileExtensions
        .map(ext => `.${ext}`)
        .filter(ext => useTypeScript || !ext.includes('ts')),
      // 别名设置
      alias: {
        'react-native': 'react-native-web',
        ...(isEnvProductionProfile && {
          'react-dom$': 'react-dom/profiling',
          'scheduler/tracing': 'scheduler/tracing-profiling',
        }),
        ...(modules.webpackAliases || {}),
      },
      // 主要是为了增加pnp 方案(webpack5 内置了该方案)
      plugins: [
        PnpWebpackPlugin,
        // 限定查看自定义模块的范围
        new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
      ],
    },
    // 
    resolveLoader: {
      plugins: [
        // 也是为了配合pnp方案，解决npm的一些痛点的
        PnpWebpackPlugin.moduleLoader(module),
      ],
    },
    // 所有的loader的配置
    module: {
      // 严格导出
      strictExportPresence: true,
      // 详细的各项配置规则
      rules: [
        // 不再支持require.ensure语法
        { parser: { requireEnsure: false } },
        // eslint的配置
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          enforce: 'pre', // 优先执行
          use: [
            {
              options: {
                cache: true,
                formatter: require.resolve('react-dev-utils/eslintFormatter'),
                eslintPath: require.resolve('eslint'),
                resolvePluginsRelativeTo: __dirname,
              },
              loader: require.resolve('eslint-loader'),
            },
          ],
          // 也是只检查src下面的文件
          include: paths.appSrc,
        },
        // 
        {
          // 数组中的loader,有且只有一个会被执行
          // 优化loader匹配速度，否则的话，每个文件会被每个loader处理     
          oneOf: [
            // 图片处理
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              options: {
                // base64限制10KB 左右(根据项目实际情况限定))
                limit: imageInlineSizeLimit,
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // 处理src下js文件的兼容性
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: paths.appSrc,
              loader: require.resolve('babel-loader'),
              options: {
                customize: require.resolve(
                  'babel-preset-react-app/webpack-overrides'
                ),
                plugins: [
                  [
                    require.resolve('babel-plugin-named-asset-import'),
                    {
                      loaderMap: {
                        svg: {
                          ReactComponent:
                            '@svgr/webpack?-svgo,+titleProp,+ref![path]',
                        },
                      },
                    },
                  ],
                ],
                cacheDirectory: true,
                cacheCompression: false,
                compact: isEnvProduction,
              },
            },
            // 处理src目录以外的js文件的兼容性
            {
              test: /\.(js|mjs)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    require.resolve('babel-preset-react-app/dependencies'),
                    { helpers: true },
                  ],
                ],
                cacheDirectory: true,
                cacheCompression: false,
                
                
                sourceMaps: shouldUseSourceMap,
                inputSourceMap: shouldUseSourceMap,
              },
            },
            // 处理css文件，排除掉node_modules下的
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction && shouldUseSourceMap,
              }),
              sideEffects: true,
            },
            // 处理node_module下的css文件
            {
              test: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction && shouldUseSourceMap,
                // 做样式模块化的，加组件唯一标示
                // 以.module.css结尾会开启
                modules: {
                  getLocalIdent: getCSSModuleLocalIdent,
                },
              }),
            },
            // sass 样式文件处理, 除开node_modules下的
            {
              test: sassRegex,
              exclude: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isEnvProduction && shouldUseSourceMap,
                },
                'sass-loader'
              ),
              // 标记为有副作用的，不需要tree-shaking
              sideEffects: true,
            },
            // 单独处理mode_modules下的sass文件
            {
              test: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isEnvProduction && shouldUseSourceMap,
                  modules: {
                    getLocalIdent: getCSSModuleLocalIdent,
                  },
                },
                'sass-loader'
              ),
            },
            // 处理其他文件，一般做收尾工作，位于其他处理规则之后
            {
              loader: require.resolve('file-loader'),
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
           
          ],
        },
      ],
    },
    // set path alias
    // alias: {
    //   'utils': path.resolve(__dirname, '../src/utils'),
    //   'components': path.resolve(__dirname, '../src/components'),
    //   'actions': path.resolve(__dirname, '../src/action'),
    //   'reducers': path.resolve(__dirname, '../src/reducers'),
    //   'consts': path.resolve(__dirname, '../src/consts'),
    //   'images': path.resolve(__dirname, '../src/images'),
    //   'middlewares': path.resolve(__dirname, '../src/middlewares'),
    // },

    // 插件处理
    plugins: [
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            template: paths.appHtml,
          },
          // 生产环境多一个html的minify压缩
          isEnvProduction
            ? {
                minify: {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true,
                },
              }
            : undefined
        )
      ),
      // 是否要内联runtime文件：作用就是能够少发一个请求
      // cross-env INLINE_RUNTIME_CHUNK = true，能够开启
      isEnvProduction &&
        shouldInlineRuntimeChunk &&
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),
      // 解析index.html中的 &PUBLIC_URL% 
      new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
      // 给ModuleNotFoundPlugin更好的提示
      new ModuleNotFoundPlugin(paths.appPath),
      // 定义环境变量
      new webpack.DefinePlugin(env.stringified),
      // 开发环境下需要HMR功能
      isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
      // 开发环境下检测文件路径：严格区分大小写
      isEnvDevelopment && new CaseSensitivePathsPlugin(),
      // 检测node_modules, 一旦有模块丢失的话会重启devServer
      isEnvDevelopment &&
        new WatchMissingNodeModulesPlugin(paths.appNodeModules),
      // 提取css为单独的文件
      isEnvProduction &&
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
      // 
      new ManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: paths.publicUrlOrPath,
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
          }, seed);
          const entrypointFiles = entrypoints.main.filter(
            fileName => !fileName.endsWith('.map')
          );
          return {
            files: manifestFiles,
            entrypoints: entrypointFiles,
          };
        },
      }),
      // 忽略moment的各种语言包，可以用datejs替代，还能开启tree-shaking
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      // PWA的配置：离线可访问技术
      isEnvProduction &&
        new WorkboxWebpackPlugin.GenerateSW({
          clientsClaim: true,
          exclude: [/\.map$/, /asset-manifest\.json$/],
          importWorkboxFrom: 'cdn',
          navigateFallback: paths.publicUrlOrPath + 'index.html',
          navigateFallbackBlacklist: [
            new RegExp('^/_'),
            new RegExp('/[^/?]+\\.[^/]+$'),
          ],
        }),
      // ts的相关配置
      useTypeScript &&
        new ForkTsCheckerWebpackPlugin({
          typescript: resolve.sync('typescript', {
            basedir: paths.appNodeModules,
          }),
          async: isEnvDevelopment,
          useTypescriptIncrementalApi: true,
          checkSyntacticErrors: true,
          resolveModuleNameModule: process.versions.pnp
            ? `${__dirname}/pnpTs.js`
            : undefined,
          resolveTypeReferenceDirectiveModule: process.versions.pnp
            ? `${__dirname}/pnpTs.js`
            : undefined,
          tsconfig: paths.appTsConfig,
          reportFiles: [
            '**',
            '!**/__tests__/**',
            '!**/?(*.)(spec|test).*',
            '!**/src/setupProxy.*',
            '!**/src/setupTests.*',
          ],
          silent: true,
          formatter: isEnvProduction ? typescriptFormatter : undefined,
        }),
      // 配置简化路径
      // new webpack.LoaderOptionsPlugin({
      //   options: {
      //     alias: {
      //       'utils': path.resolve(__dirname, '../src/utils'),
      //       'components': path.resolve(__dirname, '../src/components'),
      //       'actions': path.resolve(__dirname, '../src/action'),
      //       'reducers': path.resolve(__dirname, '../src/reducers'),
      //       'consts': path.resolve(__dirname, '../src/consts'),
      //       'images': path.resolve(__dirname, '../src/images'),
      //       'middlewares': path.resolve(__dirname, '../src/middlewares'),
      //     }
      //   }
      // })
    ].filter(Boolean),
    // 将一些nodeu_modules下可能会打包进来的文件，置为空
    // 因为不需要
    node: {
      module: 'empty',
      dgram: 'empty',
      dns: 'mock',
      fs: 'empty',
      http2: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    },
    // 关闭性能提示，开启的话，会导致比较卡顿
    // 用另外的插件来进行性能分析
    performance: false,
  };
};

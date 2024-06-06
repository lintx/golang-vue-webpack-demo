'use strict';
const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const WebPack = require('webpack');
const {VueLoaderPlugin} = require('vue-loader');

//会编译的html文件后缀
const htmlExtensions = ['.html','.htm','.tpl'];

const host = {
    dev:'/',
    test:'//example.com/',
    dis:'/'
};

//目录配置
const paths = {
    root:{
        //开发环境输出根目录
        dev:path.resolve(__dirname, './dist'),
        test:path.resolve(__dirname, './dist'),
        //生产环境输出根目录
        dis:path.resolve(__dirname, './dist'),
        //源码文件根目录
        src:path.resolve(__dirname, './src')
    },
    outpath:{
        //输出的js文件目录
        js:'static/js/',
        //输出的图片文件目录
        img:'static/images/',
        //输出的字体文件目录
        font:'static/fonts/',
        //输出的css文件目录
        css:'static/css/',
        //输出的模版文件目录
        html:'template/'
    },
    srcpath:{
        //js源码文件所在目录
        js:'static/js/',
        //模版源码文件所在目录
        html:'template'
    }
};

module.exports = function (env, argv) {
    let mode = 'development';
    let development = true;
    let testMode = false;
    if (typeof env === 'object' && env.hasOwnProperty('production') && env.production === true) {
        mode = 'production';
        development = false;
    }
    if (typeof env === 'object' && env.hasOwnProperty('production') && env.test === true) {
        testMode = true
    }
    let publicPath,outPath;
    if (development){
        if (testMode){
            publicPath = host.test
            outPath = paths.root.test
        }else {
            publicPath = host.dev
            outPath = paths.root.dev
        }
    }else {
        publicPath = host.dis
        outPath = paths.root.dis
    }
    let webpackConfig = {
        // mode: 'none',//"production" | "development" | "none"
        mode: mode,
        entry: {},//具体内容由后面编写的脚本填充
        output: {
            //输出文件根目录，绝对路径
            path: outPath,

            //输出文件名
            filename: `${paths.outpath.js}[name].js`,

            //sourcemap输出文件名
            //[file]:生成后的js文件名（包括路径）,[filebase]:生成后的js文件名（不包括路径）
            sourceMapFilename: '[file].map',

            // publicPath: 相对目录，可以使用cdn地址（开发环境不设置等）
            publicPath:publicPath,

            //清理目录
            clean:true,
        },
        resolve: {
            extensions:[".vue","..."],
        },
        //优化选项
        optimization:{
            splitChunks:{
                cacheGroups:{
                    //公共模块配置
                    commons:{
                        //对导入方式的设置，'async':只管动态导入的，'initial':只管静态导入的，'all':所有的
                        //静态导入：import 'xxx',动态导入：import('xxx')
                        chunks: 'all',
                        //有2个chunk使用才切分到公共文件中
                        minChunks:2,
                        //最大并发数，简单理解为一个entry及包含的文件最多被拆分成多少个chunk
                        maxInitialRequests:5,
                        //0以上的大小就会切分chunk
                        minSize:0,
                        // name:'[chunkhash]'//影响文件名、sourcemap文件名、其他地方引用的chunk的name
                        // filename:paths.outpath.js+'common.js'
                    },
                }
            },
            minimizer: [
                new CssMinimizerPlugin(),
                // 在 optimization.minimizer 中可以使用 '...' 来访问默认值。
                '...',
            ],
        },
        module: {
            rules: [
                {
                    //对ES6语法进行编译
                    test: /\.js$/i,
                    exclude:/[\\/]node_modules[\\/]/i,
                    loader:'babel-loader',
                    options:{presets:['@babel/preset-env']}
                },
                {
                    //css文件的处理
                    test: /\.(css|scss)$/i,
                    use : [
                        //使用插件将css文件提取为单独的文件
                        MiniCssExtractPlugin.loader,

                        //css解析需要的配置
                        'css-loader',

                        // 处理CSS压缩、@import等需要的配置
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        ['postcss-import',],
                                        ['autoprefixer', {overrideBrowserslist: ['last 30 versions', "> 2%", "Firefox >= 10", "ie 6-11"]},],
                                    ],
                                },
                            },
                        },
                        //处理sass
                        {
                            loader: 'sass-loader',
                            options: {
                                sassOptions: {
                                    includePaths: [path.resolve(__dirname, 'node_modules')],
                                },
                            },
                        },
                    ]
                },
                {
                    //css中图片的处理
                    test: /\.(png|svg|jpg|gif)$/i,
                    use:[
                        {
                            //使用urlloader将图片自动转换成base64/文件
                            loader:'url-loader',
                            options:{
                                //文件名
                                name:paths.outpath.img+'[name].[ext]',
                                //必须加上这个，否则图片类资源的url会变成类似{"default":"img/01.6b0f10f0.jpg"}形式
                                esModule: false,
                                //单独的publicpath
                                publicPath:publicPath,
                                // outputPath:path.resolve(__dirname, development?'./output/dev':'./output/dis'),

                                //base64/文件的文件大小界限（K）
                                limit:200
                            }
                        }
                    ]
                },
                {
                    test:/\.(woff|woff2|eot|ttf|otf|svg)$/i,
                    use:[
                        {
                            loader:'file-loader',
                            options:{
                                name:paths.outpath.font+'[name].[ext]',
                                publicPath:publicPath,
                                limit: 0
                            }
                        }
                    ]
                },
                {
                    //.vue的规则必须放到.html的前面，否则煞笔vue-loader会匹配到html规则里面没有应用vue-loader而报错，几年了还不修
                    test: /\.vue$/,
                    use: ['vue-loader']
                },
                {
                    //处理html文件中的资源文件，比如图片，提取后匹配上面的图片test，然后由urlloader处理
                    test:/\.(html)$/i,
                    use:['html-withimg-loader']
                },
            ]
        },
        plugins: [
            //css单独打包插件
            new MiniCssExtractPlugin({filename:`${paths.outpath.css}[name].css`}),

            //全局使用jq
            new WebPack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery"
            }),

            new VueLoaderPlugin()
        ],
        // devtool 更详细的资料：https://segmentfault.com/a/1190000008315937
        devtool: development ? 'inline-cheap-module-source-map' : false
        // devtool: 'source-map'
    };

    //批量遍历寻找html文件，然后寻找对应的js文件，并添加到webpack config中
    const loadTemplates = (root,sub)=>{
        const currentAbsPath = path.resolve(root,paths.srcpath.html,sub);

        //读取子目录文件列表
        const files = fs.readdirSync(currentAbsPath);
        for (const file of files){
            const fileAbsPath = path.resolve(currentAbsPath,file);   //文件/文件夹绝对路径
            const stat = fs.statSync(fileAbsPath);
            if (stat.isDirectory()){
                loadTemplates(root,path.join(sub,file));        //是目录，遍历子目录
            }else {
                const extension = path.extname(file);

                //只处理指定后缀的文件
                if (htmlExtensions.indexOf(extension.toLocaleString())===-1) continue

                const name = file.substring(0,file.lastIndexOf(extension));   //获取不带后缀的文件名
                const jsAbsPath = path.resolve(root,paths.srcpath.js,sub,`${name}.js`);    //组装对应的js文件的绝对路径
                const entryName = `${sub}.${name}`.replace("\\",".").replace("/",".")   //js文件名
                const chunks = []

                //对应的js文件存在，则添加进entry
                if (fs.existsSync(jsAbsPath) && fs.statSync(jsAbsPath).isFile()){
                    webpackConfig.entry[entryName] = jsAbsPath;
                    chunks.push(entryName)
                }

                //添加htmlwebpackplugin配置
                webpackConfig.plugins.push(new HtmlWebpackPlugin({
                    filename: path.join(paths.outpath.html,sub,`${name}${extension}`),  //模板文件输出文件名
                    template: fileAbsPath,  //模板文件（源文件）
                    inject: 'body', //插入的内容在哪里（true|'head'|'body'|false）
                    xhtml: true,    //是否闭合link标签(xhtml标准)
                    hash: true, //在插入的js、css标签后面加上hash
                    chunks: chunks,    //这个html文件中插入的chunks
                    minify:{
                        collapseWhitespace: true,
                        keepClosingSlash: true,
                        removeComments: true,
                        removeRedundantAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true,
                        useShortDoctype: true,
                        caseSensitive: true  // 这里设置为true，禁止标签名转为小写
                    },
                }));
            }
        }
    };
    loadTemplates(paths.root.src,'');

    return webpackConfig;
};
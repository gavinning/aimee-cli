var path = require('path');
var home = process.env.HOME;
var folder = '.aimee';
var templateFolder = path.join(__dirname, 'template');

function config() {
    return {

        charset: 'utf-8',

        dir: {
            // 项目真实目录
            project: './src',
            // 测试命令目录
            command: './lib/',
            // 真实命令前缀
            commandPrefix: 'aimee-command-',
            // 本地aimee缓存目录
            cache: path.join(home, folder),
            // 本地aimee模块库目录
            rep: path.join(home, folder, 'rep')
        },

        // 项目中文件夹命名
        name: {
            pages: 'pages',
            widget: 'widget',
            modules: 'modules'
        },

        // 模板文件，用于命令创建文件的模板
        template: {
            'html'          : path.join(templateFolder, 'index.html'),
            'appjs'         : path.join(templateFolder, 'app/app.js'),
            'appjade'       : path.join(templateFolder, 'app/app.jade'),
            'appless'       : path.join(templateFolder, 'app/app.less'),
            'appjsonjs'     : path.join(templateFolder, 'app/app.json.js'),
            'pagejs'        : path.join(templateFolder, 'page/page.js'),
            'pagejade'      : path.join(templateFolder, 'page/page.jade'),
            'pagejsonjs'    : path.join(templateFolder, 'page/page.json.js'),
        },

        types: {

        },

        // 创建配置 => aimee create [options] <appname>
        create: {

            // aimee init
            // 用于初始化缓存目录 ~/.aimee
            init: {
                name: 'init',
                type: 'folder',
                flag: 'cache',
                content: [
                    {
                        // 文件名称
                        name: folder,
                        // 文件类型
                        type: 'folder',
                        // 文件路径
                        path: path.join(home, folder),
                        // 文件目录
                        dirname: home
                    }
                ]
            },

            // 用于创建项目模型
            project: {
                // 项目名称，会被命令行参数覆盖
                name: 'project',
                // 文件类型，文件创建依据
                type: 'folder',
                // Aimee标记
                flag: 'project',
                // Aimee.app依赖
                mods: ['aimee'],
                // 文件内容
                content: [
                    {
                        name: 'index.html',
                        type: 'html'
                    },
                    {
                        name: 'uzconfig.js',
                        type: 'text'
                    },
                    {
                        name: 'js',
                        type: 'folder'
                    },
                    {
                        name: 'css',
                        type: 'folder',
                        content: [
                            {
                                name: 'lib',
                                type: 'folder',
                                content: [
                                    {
                                        name: 'base.less',
                                        type: 'text'
                                    },
                                    {
                                        name: 'reset.less',
                                        type: 'text'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'images',
                        type: 'folder'
                    },
                    {
                        name: 'pages',
                        type: 'folder',
                        content: [
                            {
                                name: 'home',
                                flag: 'page',
                            }
                        ]
                    },
                    {
                        name: 'modules',
                        type: 'folder'
                    },
                    {
                        name: 'widget',
                        type: 'folder'
                    }
                ]
            }
        }
    }
}

module.exports = config();

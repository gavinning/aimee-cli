var path = require('path');
var home = process.env.HOME;
var folder = '.aimee';

function config() {
    return {

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

        // 创建配置
        create: {

            // 用于初始化缓存目录 ~/.aimee
            init: {
                name: 'init',
                type: 'init',
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
                name: 'project',
                type: 'project',
                flag: '--project',
                content: [
                    {
                        name: 'index.html',
                        type: 'html'
                    },
                    {
                        name: 'pages',
                        type: 'folder',
                        content: 'home'
                    },
                    {
                        name: 'modules',
                        type: 'folder',
                        content: 'aimee pm page app'
                    },
                    {
                        name: 'widget',
                        type: 'folder',
                        content: 'header footer tips'
                    }
                ]
            }
        }
    }
}

module.exports = config();

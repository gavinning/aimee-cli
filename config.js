var path = require('path');
var home = process.env.HOME;
var folder = '.aimee';
var templateFolder = path.join(__dirname, 'template');

function config() {
    return {

        // !
        charset: 'utf-8',

        // !
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

        // !
        registry: {
            host: 'http://127.0.0.1:3000',
            pathname: '/g/aimee/api/'
        },

        // !
        urls: {
            reg: '/g/user/api/reg',
            login: '/g/user/api/login'
        },

        // ! 项目中文件夹命名
        name: {
            pages: 'pages',
            widget: 'widget',
            modules: 'modules',
            configFile: 'aimee.json'
        },

        // ! 模板文件，用于命令创建Aimee对象的模板
        template: {
            // For index.html
            'html'          : path.join(templateFolder, 'index.html'),

            // For app
            'appjs'         : path.join(templateFolder, 'app/app.js'),
            'appjade'       : path.join(templateFolder, 'app/app.jade'),
            'appless'       : path.join(templateFolder, 'app/app.less'),
            'appjsonjs'     : path.join(templateFolder, 'app/app.json.js'),
            'appconfig'     : path.join(templateFolder, 'app/package.json'),

            // For page
            'pagejs'        : path.join(templateFolder, 'page/page.js'),
            'pagejade'      : path.join(templateFolder, 'page/page.jade'),
            'pagejsonjs'    : path.join(templateFolder, 'page/page.json.js'),

            // For example-page
            'e-pagejs'      : path.join(templateFolder, 'example/page.js'),
            'e-pagejade'    : path.join(templateFolder, 'example/page.jade'),

            // For less
            'baseless'      : path.join(templateFolder, 'css/base.less'),
            'skinless'      : path.join(templateFolder, 'css/skin.less'),
            'commonless'    : path.join(templateFolder, 'css/common.less'),

            // For js
            'init'          : path.join(templateFolder, 'js/init.js'),
            'modjs'         : path.join(templateFolder, 'js/mod.js'),
            'runtimejs'     : path.join(templateFolder, 'js/runtime.js'),
            'uzconfigjs'    : path.join(templateFolder, 'js/uzconfig.js'),

            // For aimee.json
            'aimeejson'     : path.join(templateFolder, 'aimee.json')
        },

        // ! 创建配置 => aimee create [options] <appname>
        // 其所有属性都属于特殊Flag关键字
        create: {
            // Flag app
            app: {
                name: 'app',
                replace: /^app\b/,
                content: [
                    {
                        path: 'app.js',
                        template: 'appjs'
                    },
                    {
                        path: 'app.jade',
                        template: 'appjade'
                    },
                    {
                        path: 'app.json.js',
                        template: 'appjsonjs'
                    },
                    {
                        path: 'app.less',
                        template: 'appless'
                    }
                ]
            },

            // ! Flag page
            page: {
                name: 'page',
                replace: /^page\b/,
                content: [
                    {
                        path: 'page.js',
                        template: 'pagejs'
                    },
                    {
                        path: 'page.jade',
                        template: 'pagejade'
                    },
                    {
                        path: 'page.json.js',
                        template: 'pagejsonjs'
                    }
                ]
            },

            examlplePage: {
                name: 'page',
                replace: /^page\b/,
                content: [
                    {
                        path: 'page.js',
                        template: 'e-pagejs'
                    },
                    {
                        path: 'page.jade',
                        template: 'e-pagejade'
                    },
                    {
                        path: 'page.json.js',
                        template: 'pagejsonjs'
                    }
                ]
            },

            // ! Flag project
            // Aimee create命令会根据此配置文件创建Flag
            project: {
                // 项目名称，会被命令行参数覆盖
                name: 'project',
                // Flag默认依赖的模块，Flag创建后会自动安装
                mods: 'aimee is extend guid config router class pm app page mock autoscreen base loading reset zepto swipe helloworld'.split(' '),
                // 文件内容
                content: [
                    {
                        path: 'uzconfig.js',
                        template: 'uzconfigjs'
                    },
                    {
                        path: 'aimee.json',
                        template: 'aimeejson'
                    },
                    {
                        path: 'src/index.html',
                        template: 'html'
                    },
                    {
                        path: 'src/js/lib/mod.js',
                        template: 'modjs'
                    },
                    {
                        path: 'src/js/lib/runtime.js',
                        template: 'runtimejs'
                    },
                    {
                        path: 'src/images',
                        flag: 'Folder'
                    },
                    {
                        path: 'src/modules',
                        flag: 'Folder'
                    },
                    {
                        path: 'src/pages/home',
                        flag: 'examlplePage'
                    },
                    {
                        path: 'src/widget/header',
                        flag: 'app'
                    },
                    {
                        path: 'src/pages/init.js',
                        template: 'init'
                    },
                    {
                        path: 'src/css/base.less',
                        template: 'baseless',
                    },
                    {
                        path: 'src/css/skin.less',
                        template: 'skinless',
                    },
                    {
                        path: 'src/css/common.less',
                        template: 'commonless',
                    }
                ]
            }
        }
    }
}

module.exports = config();

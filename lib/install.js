var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var config = require('vpm-config');
var http = require('vpm-http');
var color = require('bash-color');
var package = require('vpm-package');
var Msg = require('./msg');

exports.name = 'i [appname]';
exports.alias = 'install';
exports.description = 'install aimee app';

// 解压到模块到目标目录
exports.package = function(app){
    lib.mkdir(app.path);
    package.unzip(app.zip.path, app.path)
    console.log(
        color.purple(app.name + '@' + app.version),
        'Install to',
        color.green(path.relative(process.cwd(), app.path)),
        'success.'
    )
}

/**
 * 安装模块
 * @param   {String}  app.name    模块名称
 * @param   {String}  app.path    模块安装路径
 * @param   {String}  app.version 模块版本
 * @example this.install({name: 'share', version: '1.0.0', path: '~/doc'});
 */
exports.one = function(app){
    app.zip = {};
    app.zip.name = lib.getZipName(app);
    app.zip.path = path.join(config.get('dir.rep'), app.name, app.zip.name);

    // 检查缓存目录是否已存在该模块
    if(lib.isFile(app.zip.path)){
        return exports.package(app)
    }

    // 生成下载接口
    app.url = exports.aimee.url('app', ['name=', app.name, '&', 'version=', app.version].join(''));

    // 创建目标文件夹
    lib.mkdir(path.dirname(app.zip.path));

    // 从服务器安装
    http.download(app.url, app.zip.path, function(e){
        if(e) throw e;
        exports.package(app)
    })
}

// 格式化安装参数
// @example this.parse(['share', 'footer@1.0.0', 'header'])
exports.parse = function(args){
    var apps = [];
    var configFile = lib.find('uzconfig.js');
    var project = lib.projectInfo(path.dirname(configFile));
    args.forEach(function(item){
        // 过滤参数
        if(item.indexOf('-') < 0){
            apps.push({
                name: item.split('@')[0],
                path: path.join(project.modules, item.split('@')[0]),
                version: item.split('@')[1]
            })
        }
    })
    return apps;
}

// Help
exports.outputHelp = function(){
    console.log('aimee install')
    console.log('aimee install <package>')
    console.log('aimee install <package>@<version>')
}


// 查询服务器模块信息，然后安装
exports.query = function(app){
    // 查询服务器当前模块的相关信息
    exports.aimee.cli.info.query(app.name, function(err, res, msg){
        var res;

        if(err){
            return console.log(err.message)
        }

        // 服务器不存在该模块
        if(res.statusCode === 404){
            return console.log(404 + ' 模块不存在')
        }

        // 查询成功，安装模块的最新版本
        if(res.statusCode === 200){
            res = JSON.parse(msg);
            app.version = app.version || res.version;

            // 检查服务器是否存在当前版本
            if(res.versions.indexOf(app.version) >= 0){
                return exports.one(app);
            }

            else {
                lib.rm(app.path);
                return console.log('404 服务器没有这个版本 ' + app.version)
            }
        }

        console.log(res.statusCode, msg);
    })
}

// 安装模块
exports.install = function(arr){
    var error = new Msg;

    arr.forEach(function(app){
        // 检查是否通过安装条件
        // 检查目标目录是否是非空目录
        if(!lib.isEmpty(app.path)){
            return error.push(
                color.red('Error:'),
                app.name,
                'Install fail',
                path.relative(process.cwd(), app.path),
                'is exist.'
            )
        }

        exports.query(app);
    })

    if(error.get().length){
        console.log(error.get().join('\n'))
    }
}

// 命令注册核心
exports.reg = function(commander){
    commander
        .command(this.name)
        .alias(this.alias)
        .description(this.description)
        .option('-h, --help', 'install aimee app')
        .action(function(argv, options){
            // 检查是否是显示帮助信息
            if(process.argv.indexOf('-h') > 0 || process.argv.indexOf('--help') > 0){
                return exports.outputHelp()
            }

            // 查找配置文件，定位项目位置
            if(!lib.isFile(lib.find('uzconfig.js'))){
                return console.log('error: can\'t find uzconfig.js')
            }

            // 检查命令，如果没有指定安装模块则检查是否存在package.json
            if(!argv){
                return console.log('error:', 'cant\'t find package.json')
            }

            // Install
            exports.install(exports.parse(process.argv.slice(3)))
        })
}

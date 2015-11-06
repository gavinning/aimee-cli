var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var config = require('vpm-config');
var http = require('vpm-http');
var color = require('bash-color');
var package = require('vpm-package');
var pm = require('thenjs');
var Msg = require('./msg');
var errorMsg = new Msg;
var successMsg = new Msg;

exports.name = 'i [appname]';
exports.alias = 'install';
exports.description = 'install aimee app';

// 解压到模块到目标目录
exports.package = function(app, cont){
    lib.mkdir(app.path);
    package.unzip(app.zip.path, app.path)
    successMsg.push(
        color.green('+') +
        color.green(app.name) +
        color.green('@') +
        color.green(app.version)
    );
    cont();
}

/**
 * 安装模块
 * @param   {String}  app.name    模块名称
 * @param   {String}  app.path    模块安装路径
 * @param   {String}  app.version 模块版本
 * @example this.install({name: 'share', version: '1.0.0', path: '~/doc'});
 */
exports.one = function(app, cont){
    app.zip = {};
    app.zip.name = lib.getZipName(app);
    app.zip.path = path.join(config.get('dir.rep'), app.name, app.zip.name);

    // 检查缓存目录是否已存在该模块
    if(lib.isFile(app.zip.path)){
        return exports.package(app, cont)
    }

    // 生成下载接口
    app.url = exports.aimee.url('app', ['name=', app.name, '&', 'version=', app.version].join(''));

    // 创建目标文件夹
    lib.mkdir(path.dirname(app.zip.path));

    // 从服务器安装
    http.download(app.url, app.zip.path, function(e){
        if(e) throw e;
        exports.package(app, cont)
    })
}

// 格式化安装参数
// @example this.parse(['share', 'footer@1.0.0', 'header'])
exports.parse = function(args, modules){
    var apps = [];
    var modules = modules || lib.getModPath();
    args.forEach(function(item){
        // 过滤参数
        if(item.indexOf('-') < 0){
            apps.push({
                name: item.split('@')[0],
                path: path.join(modules, item.split('@')[0]),
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

exports.install = function(arr, fn){
    // 检查模块安装位置是否已存在
    pm.each(arr, function(cont, app){
        if(lib.isEmpty(app.path)){
            cont(null, app)
        }
        else{
            errorMsg.push(
                color.red('error:'),
                app.name,
                'install failure',
                path.relative(process.cwd(), app.path),
                'is exist.'
            );
            cont();
        }
    })
    // 查询服务器是否存在该模块
    .each(null, function(cont, app, succ, error){
        if(!app) return cont()

        // 查询App相关信息
        exports.aimee.cli.info.query(app.name, function(err, res, msg){
            if(err) return cont(err);

            // 服务器不存在该模块
            if(res.statusCode === 404){
                errorMsg.push(color.red('error:'), app.name, 'is not found');
                return cont();
            }

            // 查询成功，安装模块的最新版本
            if(res.statusCode === 200){
                res = JSON.parse(msg);
                app.version = app.version || res.version;

                // 检查服务器是否存在当前版本
                if(res.versions.indexOf(app.version) >= 0){
                    return cont(null, app)
                }

                else {
                    lib.rm(app.path);
                    errorMsg.push(color.red('error:'), app.name+'@'+app.version, 'is not found');
                    return cont();
                }
            }
        })
    })

    // 执行安装
    .each(null, function(cont, app){
        app ? exports.one(app, cont) : cont()
    })
    // 检查安装成功或失败消息
    .then(function(cont){
        if(fn){
            fn(successMsg.get(), errorMsg.get())
        }
        else{
            successMsg.get().length > 0 && console.log(successMsg.get().join('\n'))
            errorMsg.get().length > 0 && console.log(errorMsg.get().join('\n'))
        }
    })
    // Find error
    .fail(function (cont, error) {
        throw error;
    });
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

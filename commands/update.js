var $ = require('co');
var fs = require('fs');
var path = require('path');
var color = require('bash-color');
var lib = require('linco.lab').lib;
var Gre = require('gre');
var gre = Gre.create();
var config = require('vpm-config');
var configFileName = config.get('name.configFile');
var succ = [];
var warn = [];
var error = [];

exports.name = 'u [appname]';
exports.alias = 'update';
exports.description = 'update aimee app';

// 格式化参数
exports.parse = function(name){
    var app = {};
    // 查询modules文件夹路径
    var modules = lib.getModPath();
    // 解析name与version
    var arr = name.split('@');
    app.name = arr[0];
    app.path = path.join(modules, app.name);

    // 过滤参数
    if(name.indexOf('-') === 0){
        return {}
    }

    // 读取aimee.json
    try{
        app.package = require(path.join(app.path, configFileName));

    // 读取失败则默认为空
    }catch(e){
        app.package = {}
    }

    app.version = arr[1] || app.package.version || null;
    return app;
}

function install(arr, args) {
    return new Promise((resolve, reject) => {
        aimee.cli.install.install(
            aimee.cli.install.parse(arr),
            function(err, success){
                succ = succ.concat(success);
                error = error.concat(err);
                return resolve();
        })
    })
}

function remove(name) {
    return new Promise((resolve, reject) => {
        aimee.cli.remove.remove(aimee.cli.remove.parse([name]), function(err, name, version){
            if(err) return reject(err)
            version ?
                console.log(color.green('-' + name + '@' + version)):
                console.log(color.green('-' + name));
            resolve()
        })
    })
}

function query(app) {
    return new Promise((resolve, reject) => {
        // 从Server查询App相关信息
        exports.aimee.cli.info.query(app.name, function(err, res, msg){
            let _app;

            if(err) return reject(err);

            // 服务器不存在该模块
            if(res.statusCode === 404){
                // 写入到错误信息数组
                error.push(color.red(app.name));
                return resolve();
            }

            // App信息查询成功
            else if(res.statusCode === 200){
                // 格式化服务器App信息
                _app = JSON.parse(msg);

                // 对比本地与服务器App版本信息
                // 版本相同则不做更新操作，写入警告信息数组
                if(app.version === _app.version){
                    warn.push(color.green(app.name));
                    return resolve();
                }

                // 本地App版本与服务器版本不同时，执行App更新操作
                // 删除本地模块，从服务器最新版App
                resolve(1);
            }
        })
    })
}

// 更新App
exports.update = args => {
    $.call(this, function *(){
        try{
            let i = 0;
            let len = args.length;
            let installs = [];

            for (; i < len; i++) {
                let name = args[i];
                let app = exports.parse(name);
                let installFromServer = yield query(app);

                if (installFromServer) {
                    yield remove(name);
                    installs.push(name);
                }
            }
            yield install(installs, args);

            succ.length && console.log(succ.join('\n'));
            warn.length && console.log(warn.join(color.green(', ')), 'is the latest version');
            error.length && console.log(error.join(color.red(', ')), 'is not found from server');
        }
        catch(err){
            gre.error(err.message)
        }
    })
}

// 命令注册核心
exports.reg = function(commander){
    commander
        .command(this.name)
        .alias(this.alias)
        .description(this.description)
        .option('-h, --help', 'install aimee app')
        .action(function(name){
            // 查找配置文件，定位项目位置
            if(!lib.isFile(lib.find('uzconfig.js'))){
                return console.log('error: can\'t find uzconfig.js')
            }

            // 检查命令，如果没有指定安装模块则显示帮助信息
            if(name === this){
                return this.outputHelp()
            }

            exports.update(process.argv.slice(3));
        })
}

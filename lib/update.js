var fs = require('fs');
var path = require('path');
var color = require('bash-color');
var lib = require('linco.lab').lib;
var pm = require('thenjs');

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
    if(name.indexOf('-') >= 0){
        return {}
    }

    // 读取package.json
    try{
        app.package = JSON.parse(fs.readFileSync(path.join(app.path, 'package.json')))

    // 读取失败则默认为空
    }catch(e){
        app.package = {}
    }

    app.version = arr[1] || app.package.version || null;
    return app;
}

// 更新App
exports.update = function(args){
    var warn = [];
    var error = [];

    // 遍历查询需要更新的App列表
    pm.each(args, function(cont, name){
        var app = exports.parse(name);
        var _app;

        // 从Server查询App相关信息
        exports.aimee.cli.info.query(app.name, function(err, res, msg){
            if(err) return cont(err);

            // 服务器不存在该模块
            if(res.statusCode === 404){
                // 写入到错误信息数组
                error.push(color.red(app.name));
                return cont();
            }

            // App信息查询成功
            else if(res.statusCode === 200){
                // 格式化服务器App信息
                _app = JSON.parse(msg);

                // 对比本地与服务器App版本信息
                // 版本相同则不做更新操作，写入警告信息数组
                if(app.version === _app.version){
                    warn.push(color.green(app.name));
                    return cont();
                }

                // 本地App版本与服务器版本不同时，执行App更新操作
                // 删除本地模块，从服务器最新版App
                else{
                    aimee.cli.remove.remove(aimee.cli.remove.parse([name]), function(err, name, version){
                        // if(err) return console.error('Error:', err.message);
                        version ?
                            console.log(color.green('-' + name + '@' + version)):
                            console.log(color.green('-' + name));
                        // 执行安装
                        aimee.cli.install.install(aimee.cli.install.parse([name]), function(err, succ){
                            // 提示信息汇总输出
                            if(args.length === (succ.length + err.length + warn.length + error.length)){
                                succ.length && console.log(succ.join('\n'));
                                err.length && console.log(err.join('\n'));
                                return cont();
                            }
                        })
                    })
                }
            }
        })
    })
    // 更新进程完成后显示警告与错误信息
    .then(function(cont){
        // 显示警告信息
        warn.length && console.log(warn.join(color.green(', ')), 'is the latest version');
        error.length && console.log(error.join(color.red(', ')), 'is not found from server');
    })
    // Find error 程序错误
    .fail(function (cont, error) {
        console.log(error.message)
    });
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

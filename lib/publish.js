var fs = require('fs');
var ass = require('assert');
var path = require('path');
var color = require('bash-color');
var lib = require('linco.lab').lib;
var http = require('vpm-http');
var package = require('vpm-package');
var Config = require('vpm-config');
var vpmrc = require('vpm-rc');
var rc = vpmrc('.aimeerc');
var configFileName = Config.get('name.configFile');

exports.name = 'p';
exports.alias = 'publish';
exports.description = 'publish aimee app';

// 读取aimee.json
exports.config = function(){
    // 检查缓存
    if(this.__config){
        return this.__config;
    }

    // 读取aimee.json并缓存到this.__config;
    try{
        this.__config = require(path.join(process.cwd(), configFileName));
        return this.__config;
    }catch(e){
        console.log(color.red('error: ' + 'can\'t find aimee.json'))
        process.exit(1);
    }
}

// 生成模块属性
exports.info = function(){
    var config = exports.config();
    var info = {};

    // name-version.zip 模块版本地址
    info.name = [config.name, '-', config.version, '.zip'].join('');
    // name-last.zip 模块最新版本地址
    info.last = [config.name, '-last', '.zip'].join('');
    // aimee.cache/zip.name 模块缓存目录
    info.folder = path.join(Config.get('dir.rep'), config.name);
    // app物理地址
    info.src = path.join(info.folder, info.name);
    // app-last物理地址
    info.lastSrc = path.join(info.folder, info.last);

    return info;
}

// Build name-last.zip 创建模块最新版本地址
exports.last = function(){
    var info = this.info();
    lib.stream(info.src, info.lastSrc, function(err){
        if(err) console.log(err.message, 'aimee|aimee-cli|aimee-command-publish|exports.last')
    });
}

exports.check = function(){
    var config = exports.config();
    try{
        ass.ok(config, 'can\'t find ' + configFileName)
        ass.ok(config.name, configFileName + '中缺少 name 字段')
        ass.ok(config.version, configFileName + '中缺少version字段')
        ass.ok(exports.aimee.isLogin(), '请登陆')
        return true;
    }
    catch(e){
        console.error(color.red('error: ' + e.message));
        return false;
    }
}

exports.package = function(fn){
    var zip = this.info();
    // 检查是否存在app文件夹，不存在则创建
    lib.isDir(zip.folder) || lib.mkdir(zip.folder);
    package.zip('./', zip.src, fn)
}

// 提交模块
exports.publish = function(fn){
    var user = exports.aimee.config('user');

    // 打包
    exports.package(function(e, filepath){
        var options = {};
        var config = exports.config();
        if(e) throw e;
        // 获取提交api地址
        options.url = exports.aimee.url('publish');
        // 创建自定义headers
        options.headers = {};
        options.headers.name = config.name;
        options.headers.version = config.version;
        options.headers.username = user.name;
        options.headers.auth = user.auth;
        // options.headers.username
        // TODO: 这里要完善提交失败后删除缓存目录压缩包的功能
        // TODO：包括非200的任何错误
        http.upload(options, filepath, function(e, res, msg){
            if(e) throw e;
            if(res.statusCode === 200){
                console.log(['+', config.name, '@', config.version, ' success.'].join(''))
            }
            else{
                console.log(res.statusCode + ' ' + msg)
            }
        });
    });
}

// 命令注册核心
exports.reg = function(commander){
    commander
        .command(this.name)
        .alias(this.alias)
        .description(this.description)
        .action(function(){
            var config = exports.config();

            // 检查publish基础条件
            if(!exports.check()) return;

            // 查询服务器当前模块的相关信息
            exports.aimee.cli.info.query(config.name, function(err, res, msg){
                var info;

                // 检查网络异常
                if(err && err.message === 'connect ECONNREFUSED'){
                    console.log(err.message)
                    console.log(exports.aimee.error.msg[1000])
                    return
                }
                else if(err){
                    return console.log(err.message)
                }

                // 查询成功
                if(res.statusCode === 200){
                    info = JSON.parse(msg);
                    // 检查该模块是否存在
                    if(info.versions.indexOf(config.version) >= 0){
                        return console.log('Error: Please update the version')
                    }

                    return exports.publish();;
                }

                // 服务器不存在该模块，满足提交条件
                if(res.statusCode === 404){
                    return exports.publish();
                }

                console.log(res.statusCode, msg);
            })
        })

}

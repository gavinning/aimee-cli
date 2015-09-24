var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var http = require('vpm-http');
var package = require('vpm-package');
var Config = require('vpm-config');

exports.name = 'p';
exports.alias = 'publish';
exports.description = 'publish aimee app';

// 读取package.json
exports.config = function(){
    // 检查缓存
    if(this.__config){
        return this.__config;
    }

    // 读取package.json并缓存到this.__config;
    try{
        this.__config = JSON.parse(fs.readFileSync(process.cwd() + '/package.json'));
        return this.__config;
    }catch(e){}
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

// 检查命令执行条件，提交条件成立则返回zip地址
exports._check = function(){
    var config = exports.config();
    var zip = this.info();

    // 检查package.json是否存在
    if(config.package === 'none'){
        console.error('Error: can\'t find package.json');
        return false;
    }

    // 检查是否是aimee.app
    else if(config.aimee !== 'app'){
        console.error('Error: package.json not has aimee attribute');
        return false;
    }

    // 检查name字段
    else if(!config.name){
        console.error('Error: package.json not has name attribute');
        return false;
    }

    // 检查version字段
    else if(!config.version){
        console.error('Error: package.json not has version attribute');
        return false;
    }

    // 检查版本库是否存在当前版本
    if(lib.isFile(zip.src)){
        console.error('Error: version can\'t resubmit, Please update the version');
        return false;
    }

    // 检查是否存在app文件夹，不存在则创建
    lib.isDir(zip.folder) || lib.mkdir(zip.folder);

    return zip.src;
}

exports.check = function(){
    var config = exports.config();

    // 检查package.json是否存在
    if(!config){
        console.error('Error: can\'t find package.json');
        return false;
    }

    // 检查是否是aimee.app
    else if(config.aimee !== 'app'){
        console.error('Error: package.json not has aimee attribute');
        return false;
    }

    // 检查name字段
    else if(!config.name){
        console.error('Error: package.json not has name attribute');
        return false;
    }

    // 检查version字段
    else if(!config.version){
        console.error('Error: package.json not has version attribute');
        return false;
    }

    return true;
}

exports.package = function(fn){
    var zip = this.info();
    // 检查是否存在app文件夹，不存在则创建
    lib.isDir(zip.folder) || lib.mkdir(zip.folder);
    package.zip('./', zip.src, fn)
}

// 提交模块
exports.publish = function(fn){
    // 打包
    exports.package(function(e, filepath){
        var options = {};
        var config = exports.config();
        if(e) throw e;
        options.url = exports.aimee.url('publish');
        options.headers = {};
        options.headers.name = config.name;
        options.headers.version = config.version;
        http.upload(options, filepath, function(e, res, msg){
            if(e) throw e;
            console.log(res.statusCode, msg)
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

                if(err){
                    return console.log(err.message)
                }

                // 查询成功
                if(res.statusCode === 200){
                    info = JSON.parse(msg);
                    // 检查该模块是否存在
                    if(info.versions.indexOf(config.version) >= 0){
                        return console.log('Error: 当前版本已存在，请更新版本号')
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

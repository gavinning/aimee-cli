var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var package = require('vpm-package');
var Config = require('vpm-config');

exports.name = 'publish';
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
    }catch(e){
        return { package: 'none' }
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

// 检查命令执行条件，提交条件成立则返回zip地址
exports.check = function(){
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

// 命令注册核心
exports.reg = function(commander){
    commander
        .command(this.name)
        .description(this.description)
        .action(function(){
            var config = exports.config()
            var zipsrc = exports.check()

            // 检查提交条件
            if(!zipsrc) return;

            // 执行压缩命令
            package.zip('./', zipsrc, function(err){
                if(err) return console.log(err)
                console.log(config.name + '@' + config.version + ' publish success')
                // 创建最新版本，默认安装该版本
                exports.last();
            })
        })
}

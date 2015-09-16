var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var config = require('vpm-config');
var package = require('vpm-package');

exports.name = 'install';
exports.description = 'install aimee app \n  install aimee app@version';

// 检查安装条件
exports.check = function(name){
    var zip = {};
    zip.name = name + '-last.zip';
    zip.folder = path.join(config.get('dir.rep'), name);
    zip.src = path.join(zip.folder, zip.name);

    if(!lib.isFile(zip.src)){
        console.error('can\'t find ' + name)
        return false
    }

    return zip.src;
}

/**
 * 安装模块
 * @param   {String}  name 模块名称
 * @param   {String}  src  模块安装路径
 * @example this.install('header', './modules/header');
 */
exports.install = function(name, src){
    var zipsrc = exports.check(name);
    package.unzip(zipsrc, src);
    console.log('Install to ' + path.relative(process.cwd(), src))
}

// 命令注册核心
exports.reg = function(commander){
    commander
        .command(this.name)
        .description(this.description)
        // .option('-g, --gloabl [name]', 'install global app', this.page)
        .action(function(name){
            var uzconfig, filepath, info;

            // 检查命令，如果没有指定安装模块则显示帮助信息
            if(name === this){
                return this.outputHelp()
            }

            else{
                // 查找项目配置文件
                uzconfig = lib.find('uzconfig.js');

                // 检查是否存在uzconfig
                if(lib.isFile(uzconfig)){
                    // 获取项目信息
                    info = lib.projectInfo(path.dirname(uzconfig));
                    // 获取安装地址
                    filepath = path.join(info.modules, name);
                    // 安装指定模块
                    exports.install(name, filepath);
                }

                else{
                    console.error('Error: can\'t find uzconfig.js')
                }
            }
        })
}

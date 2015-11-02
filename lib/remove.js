var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var config = require('vpm-config');
var color = require('bash-color');
var package = require('vpm-package');
var rmdir = require('rmdir');

exports.name = 'r <appname>';
exports.alias = 'remove';
exports.description = 'remove aimee app';

// 删除命令
exports.remove = function(arr, fn){
    fn = fn || function(){};
    arr.forEach(function(app){
        lib.isDir(app.path) ?
            rmdir(app.path, fn):
            fn(new Error('can\'t find ' + app.name))
    })
}

// Help
exports.outputHelp = function(){
    console.log('aimee install')
    console.log('aimee install <package>')
    console.log('aimee install <package>@<version>')
}

// 格式化卸载参数
// @example this.parse(['share', 'footer', 'header'])
exports.parse = function(args){
    var apps = [];
    var modules = lib.getModPath();
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

// 命令注册核心
exports.reg = function(commander){
    commander
        .command(this.name)
        .alias(this.alias)
        .description(this.description)
        // .option('-g, --gloabl [name]', 'install global app', this.page)
        .action(function(name){
            // 查找配置文件，定位项目位置
            if(!lib.isFile(lib.find('uzconfig.js'))){
                return console.log('error: can\'t find uzconfig.js')
            }

            // 检查命令，如果没有指定安装模块则显示帮助信息
            if(name === this){
                return this.outputHelp()
            }

            // 卸载已安装模块
            exports.remove(exports.parse(process.argv.slice(3)), function(err, target){
                if(err) return console.error('Error:', err.message);
                console.log(color.green('-' + path.basename(target[0])))
            })
        })
}

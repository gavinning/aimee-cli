var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var config = require('vpm-config');
var package = require('vpm-package');
var rmdir = require('rmdir');

exports.name = 'r <appname>';
exports.alias = 'remove';
exports.description = 'remove aimee app';

// 删除命令
exports.remove = function(src, fn){
    return lib.isDir(src) ? rmdir(src, fn) : fn(new Error('can\'t find ' + path.basename(src)))
}

// 命令注册核心
exports.reg = function(commander){
    commander
        .command(this.name)
        .alias(this.alias)
        .description(this.description)
        // .option('-g, --gloabl [name]', 'install global app', this.page)
        .action(function(name){
            var modules;

            // 检查命令，如果没有指定安装模块则显示帮助信息
            if(name === this){
                return this.outputHelp()
            }

            else{
                // 查找项目配置文件
                modules = lib.getModPath();

                // 检查modules是否是dir
                if(lib.isDir(modules)){
                    filepath = path.join(modules, name);
                    // 删除指定模块
                    exports.remove(filepath, function(err){
                        if(err) return console.error('Error:', err.message);
                        // console.log(name, 'is removed')
                        console.log('Remove', path.relative(process.cwd(), filepath), 'success.')
                        // console.log('Install to ' + path.relative(process.cwd(), src))
                    });
                }

                else{
                    console.error('Error: can\'t find uzconfig.js')
                }
            }
        })
}

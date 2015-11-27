var path = require('path');
var color = require('bash-color');
var lib = require('linco.lab').lib;


exports.name = 'u [appname]';
exports.alias = 'update';
exports.description = 'update aimee app';

exports.update = function(args){
    aimee.cli.remove.remove(aimee.cli.remove.parse(args), function(err, name, version){
        if(err) return console.error('Error:', err.message);
        console.log(color.green('-' + name + '@' + version))
        aimee.cli.install.install(aimee.cli.install.parse(args))
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

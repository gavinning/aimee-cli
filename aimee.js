var lib = require('./lib/lib');
var path = require('path');
var commander = require('commander');
var config = require('vpm-config');


// 设置配置文件路径，必须优先独立配置
config.set('config', path.join(__dirname, 'config.js'));

// 检查是否存在 ~/.aimee 目录
// TODO: 需要重建 ~/.aimee
if(!lib.isDir(config.get('dir.cache'))){
    return console.error('Error: 没有发现缓存目录')
}

// 命令执行入口
this.run = function(argv){
    argv.length === 2 ? argv.push('--help') : argv;
    commander.parse(argv)
    return this;
}

// 命令模块化开发 命令注册入口
this.reg = function(id){
    var cmd, src;

    try{
        cmd = require(id);
    }catch(e){
        src = path.join(__dirname, config.get('dir.command'), id + '.js');
        lib.isFile(src) ? cmd = require(src) : '';
    }finally{
        cmd ? cmd.reg(commander) : '';
        cmd ? cmd.aimee = this : '';
    }
    return this;
}

// 注册命令
this.reg('create')
this.reg('publish')
this.reg('install')


//
// commander.version('1.0.0');
//
// commander
//     .command('create')
//     .description('create aimee app')
//     .option('-P, --project [name]', 'create project', cli.create.project)
//     .option('-p, --page    [name]', 'create page', cli.create.page)
//     .option('-w, --widget  [name]', 'create widget', cli.create.widget)
//     .action(function(op){
//         [].forEach.call(arguments, function(item){
//             item.parent ? console.log('options') : console.log(item)
//         })
//     })

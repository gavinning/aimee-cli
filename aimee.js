var lib = require('./lib/lib');
var path = require('path');
var touch = require('touch');
var commander = require('commander');
var config = require('vpm-config');
var color = require('bash-color');
var vpmrc = require('vpm-rc');
var rc = vpmrc('.aimeerc');

// 设置配置文件路径，必须优先独立配置
config.set('config', path.join(__dirname, 'config.js'));

// 检查是否存在 ~/.aimee 目录
// TODO: 需要重建 ~/.aimee
if(!lib.isDir(config.get('dir.cache'))){
    return console.error('Error: 没有发现缓存目录')
}

// 命令池，缓存已注册命令
this.cli = {};

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
        if(cmd){
            // 注册命令
            cmd.reg(commander);
            cmd.aimee = this;
            // 注册命令到命令池
            this.cli[cmd.alias || cmd.name] = cmd;
        }
    }
    return this;
}


/**
 * 返回带有时间戳的日志
 * @param   {String}  msg 日志信息
 * @return  {String}      返回带有时间戳的日志
 * @example [example] this.log('123') => 10:23:20 > 123
 */
this.log = function(msg){
    var arr = [];
    arr = arr.slice.call(arguments);
    arr.unshift('>');
    arr.unshift(lib.now('hh:mm:ss'));
    console.log.apply(null, arr);
}

// 返回接口
this.url = function(type, search){
    var arr = [];
    arr.push(config.get('registry.host'))
    arr.push(config.get('registry.pathname'))
    arr.push(type)
    arr.push(search ? search.indexOf('?') === 0 ? search : ('?' + search) : '')
    return arr.join('')
}

// 检查是否已登录
this.isLogin = function(){
    return rc.get('user.auth') ? true : false;
}

// 获取rc配置
this.config = function(name){
    return rc.get(name)
}

// 注册命令
this.reg('create')
this.reg('publish')
this.reg('install')
this.reg('remove')
this.reg('info')
this.reg('reg')
this.reg('login')
this.reg('logout')

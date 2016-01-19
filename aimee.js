var lib = require('./lib/lib');
var fs = require('fs');
var path = require('path');
var touch = require('touch');
var commander = require('commander');
var config = require('vpm-config');
var color = require('bash-color');
var vpmrc = require('vpm-rc');
var rc = vpmrc('.aimeerc');
root.aimee = this;
// 读取Aimee-cli/package.json
aimee.package = require(path.join(__dirname, 'package.json'));

// 设置配置文件路径，必须优先独立配置
// config.set('config', path.join(__dirname, 'config.js'));
config.init(path.join(__dirname, 'config.js'))

// 检查是否存在 ~/.aimee 目录
// TODO: 需要重建 ~/.aimee
if(!lib.isDir(config.get('dir.cache'))){
    lib.mkdir(config.get('dir.cache'))
}

// 检查全局配置文件是否存在registry设置
if(rc.get('registry')){
    config.set('registry.host', rc.get('registry'))
}
// rc.set('registry', 'http://gavinning2.kf0309.3g.qq.com')

// 命令池，缓存已注册命令
this.cli = {};

/**
 * 重要的
 * 默认生成版本前缀
 * 用于semver解析需要安装的版本
 * 所有更新依赖的地方需要引用此对象
 * @type {String}
 */
this.versionPrefix = '~';

/**
 * 包装需要设置前缀的版本号
 * @param   {String}  string 需要包装的版本号
 * @return  {String}         this.versionPrefix + string
 * @example this.setVersionPrefix('1.0.0') // => ~1.0.0
 */
this.setVersionPrefix = function(string){
    return this.versionPrefix + string;
}


/**
 * 命令执行入口
 * @param   {Array}  argv 命令行参数
 * @example this.run([])
 */
this.run = function(argv){
    argv.length === 2 ? argv.push('--help') : argv;
    commander
        .option('-v, --version', 'output the version number', function(){ console.log(aimee.package.version) })
        .parse(argv)
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

// 返回Server接口
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

this.error = {};
this.error.msg = {
    '1000': '网络连接异常，请检查网络或内网限制策略'
}


// 注册命令
this.reg('init')
this.reg('create')
this.reg('remove')
this.reg('update')
this.reg('install')
this.reg('publish')
this.reg('info')
this.reg('reg')
this.reg('login')
this.reg('logout')

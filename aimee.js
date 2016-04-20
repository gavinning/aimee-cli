var fs = require('fs');
var path = require('path');
var touch = require('touch');
var color = require('bash-color');
var config = require('vpm-config');
var commander = require('commander');
var lib = require('./lib/lib');

root.aimee = this;

// 读取 ~/.aimeerc 配置文件
aimee.rc = lib.getRC();

// 读取Aimee-cli/package.json
aimee.package = require(path.join(__dirname, 'package.json'));

// 设置配置文件路径，必须优先独立配置
config.init(path.join(__dirname, 'config.js'))

// 创建 ~/.aimeerc
lib.createAimeeRc();

// 创建 ~/.aimee
lib.createAimeeFolder();

// 检查全局配置文件是否存在registry设置
if(aimee.rc.registry){
    config.set('registry.host', aimee.rc.registry)
}

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

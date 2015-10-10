var lib = require('./lib/lib');
var path = require('path');
var touch = require('touch');
var commander = require('commander');
var config = require('vpm-config');
var color = require('bash-color');
var uri = require('url');

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

// 根据配置规则创建目录和文件
this.create = function(conf){
    // process...
    if(conf.flag === 'project'){
        // 创建 project > src
        conf.path = path.join(conf.path, 'src');
        exports.log('Start  create', color.purple(conf.flag), color.green(conf.name), '...');
    }

    // Folder
    conf.type === 'folder' && this.cli.create.folder(conf.path);
    // Html
    conf.type === 'html' && this.cli.create.html(conf.path);
    // Text File
    conf.type === 'text' && this.cli.create.file(conf.path);

    // Aimee Page
    conf.flag === 'page' && this.cli.create.app(conf.path, 'page');
    // Aimee app
    conf.flag === 'app' && this.cli.create.app(conf.path, 'app');

    // 创建子级
    conf.content && conf.content.forEach(function(item){
        item.path = path.join(conf.path, item.name);
        exports.create(item)
    })
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
    var options;
    // 获取接口信息
    options = lib.extend(true, {}, config.get('url'));
    // 指定接口类型
    options.pathname = config.get('url.pathname') + type;
    // 添加模块名参数
    if(search){
        options.search = search.indexOf('?') === 0 ? search : ('?' + search);
    }
    // 返回格式化后的接口
    return uri.format(options);
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

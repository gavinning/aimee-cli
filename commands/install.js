var $ = require('co');
var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var config = require('vpm-config');
var color = require('bash-color');
var package = require('vpm-package');
var JSONFormat = require('json-format');
var semver = require('semver');
var Gre = require('gre');
var gre = Gre.create();
var Http = require('vpm-http');
var http = Http.instance({'proxy': aimee.rc.core.proxy});
var Msg = require('../lib/msg');
var errorMsg = new Msg;
var successMsg = new Msg;
// 默认版本依赖修饰符
var initVersionModifier = '~';

exports.name = 'i [appname]';
exports.alias = 'install';
exports.description = 'install aimee app';

// 解压到模块到目标目录
exports.package = function(app){
    lib.mkdir(app.path)
    package.unzip(app.zip.path, app.path)
    successMsg.push(
        color.green('+') +
        color.green(app.name) +
        color.green('@') +
        color.green(app.version)
    )
}

/**
 * 安装模块
 * @param   {String}  app.name    模块名称
 * @param   {String}  app.path    模块安装路径
 * @param   {String}  app.version 模块版本
 * @example this.install({name: 'share', version: '1.0.0', path: '~/doc'});
 */
exports.one = function(app){
    return new Promise((resolve, reject) => {
        // 如果app已安装，则忽略
        // TODO: 可以完善为检查安装版本
        if (!lib.isEmpty(app.path)) return resolve()

        app.zip = {
            name: lib.getZipName(app),
            path: path.join(config.get('dir.rep'), app.name, lib.getZipName(app))
        }

        // 检查缓存目录是否已存在该模块
        if (lib.isFile(app.zip.path)){
            exports.package(app)
            return resolve()
        }

        // 生成下载接口
        app.url = exports.aimee.url('app', ['name=', app.name, '&', 'version=', app.version].join(''))
        // 创建目标文件夹
        lib.mkdir(path.dirname(app.zip.path))
        // 从服务器安装
        http.download(app.url, app.zip.path, function(err){
            if (err) return reject(err)
            exports.package(app)
            resolve()
        })
    })
}

// 格式化安装参数
// @example this.parse(['share', 'footer@1.0.0', 'header'])
exports.parse = function(args, modules){
    var apps = [];
    var modules = modules || lib.getModPath();
    args.forEach(function(item){
        // 过滤参数
        if(item.indexOf('-') !== 0){
            apps.push({
                name: item.split('@')[0],
                path: path.join(modules, item.split('@')[0]),
                version: item.split('@')[1]
            })
        }
    })
    return apps;
}

// Help
exports.outputHelp = function(){
    console.log('  Usage: i|install [options]')
    console.log('')
    console.log('  install aimee app')
    console.log('')
    console.log('  aimee install')
    console.log('  aimee install <package>')
    console.log('  aimee install <package>@<version>')
    console.log('')
    console.log('  Options:')
    console.log('')
    console.log('    -h, --help  output usage information')
    console.log('    -s, --save  update aimee.json')
    console.log('')
}

// 从远程Server获取app信息
function getAppinfo(app, deps) {
    return new Promise((resolve, reject) => {

        if (!app) return resolve()

        // 查询App相关信息
        exports.aimee.cli.info.query(app.name, function(err, res, msg){

            if (err) return reject(err)

            // 服务器不存在该模块
            if(res.statusCode === 404){
                errorMsg.push(color.red('error:'), app.name, 'is not found')
                return resolve()
            }

            // 查询成功，安装模块的最新版本
            if(res.statusCode === 200){
                try{
                    res = JSON.parse(msg)
                }catch(e){
                    console.log(e.message)
                    throw new Error(color.red('连接服务器失败，请检查网络！'))
                }
                app.version = app.version || res.version;

                // 检查服务器是否存在当前版本
                if(res.versions.indexOf(app.version) >= 0){
                    // 缓存app信息，为依赖更新做准备
                    deps.push(app)
                    // 准备安装模块
                    return resolve(app)
                }

                else {
                    // 删除已创建的路径
                    lib.rm(app.path)
                    // 推送错误信息
                    errorMsg.push(color.red('error:'), app.name+'@'+app.version, 'is not found')
                    return resolve()
                }
            }
        })
    })
}

// 获取要安装的App的版本信息
function getAppVersion(app, aimeejson) {
    return new Promise((resolve, reject) => {
        exports.aimee.cli.info.query(app, function(err, res, msg){
            var version, versions, lastVersion;

            if (err) return reject(err)

            try{
                // 获取本地配置文件依赖版本号
                version = aimeejson.dependencies[app];
                // 获取服务器版本号列表
                versions = JSON.parse(msg).versions;
                // 确定最终安装版本
                lastVersion = semver.maxSatisfying(versions, version);
                // 缓存要安装的app版本
                // 模拟命令行安装-组合为 app@version 使用 exports.parse 格式化
                resolve(lastVersion ? [app, lastVersion].join('@') : app)
            }catch(err){
                reject(err)
            }
        })
    })
}

/**
 * 安装模块
 * @param   {Boolean}   dep 是否更新依赖，可选
 * @param   {Array}     arr 安装的app列表，必选
 * @param   {Function}  fn  安装成功回调，可选
 * @example this.install(true, [{name: app}], fn)
 */
exports.install = (dep, arr, fn) => {
    var deps = [];

    // 检查参数
    if (Array.isArray(dep)) {
        fn = arr;
        arr = dep;
        dep = false;
    }

    $.call(this, function *(){
        try{
            let i = 0;
            let len = arr.length;

            for(; i < len; i++){
                let app = yield getAppinfo(arr[i], deps)
                yield exports.one(app)
            }

            // 检查回调
            if (fn) {
                // 有回调则推送安装信息
                fn(errorMsg.get(), successMsg.get(), deps);
            }
            else{
                // 没有回调则打印安装信息
                successMsg.get().length > 0 && console.log(successMsg.get().join('\n'))
                errorMsg.get().length > 0 && console.log(errorMsg.get().join('\n'))
            }

            // 更新依赖信息
            dep && exports.updateDependencies(lib.find('aimee.json'), deps);
        }
        catch(err){
            // 检查网络异常
            if(err && err.message.includes('connect ECONNREFUSED')){
                gre.error(err.message)
                gre.error('网络连接异常，请检查网络或内网限制策略')
            }
            else if(err){
                gre.error(err.message)
            }
        }
    })
}

/**
 * 更新aimee.json依赖信息
 * @param   {String}          src   aimee.json的路径
 * @param   {Object | Array}  data  要更新的依赖信息
 * @return  {String}                美化后的JSON字符串
 * @example this.updateDependencies('aimee.json', {name: 'app', version: '1.0.0'})
 */
exports.updateDependencies = function(src, data){
    var JSONData;

    // 检查aimee.json是否存在
    if(!lib.isFile(src)){
        return console.log('Can not find aimee.json.')
    }

    // 读取aimee.json
    try{
        JSONData = JSON.parse(fs.readFileSync(src));
    }catch(e){
        throw e;
    };
    // 检查JSONData.dependencies是否存在
    JSONData.dependencies = JSONData.dependencies || {};
    // 更新aimee.json
    if(lib.isPlainObject(data)){
        // 添加默认版本修饰符
        JSONData.dependencies[data.name] = exports.aimee.setVersionPrefix(data.version);
    }
    // 更新多项
    else if(Array.isArray(data)){
        data.forEach(function(item){
            // 添加默认版本修饰符
            JSONData.dependencies[item.name] = exports.aimee.setVersionPrefix(item.version);
        })
    }

    // 美化JSONData
    JSONData = JSONFormat(JSONData, {type: 'space', size: 2})

    // 写入aimee.json
    fs.writeFileSync(src, JSONData, 'utf-8');

    return JSONData;
}

// 根据aimee.json安装全部依赖模块
exports.installDependencies = () => {
    $.call(this, function *(){
        try{
            let arr = [];
            let installList = [];
            let aimeejson = require(lib.find('aimee.json'));

            // 查询本地依赖
            lib.each(aimeejson.dependencies, function(key, val){
                arr.push(key)
            })

            let i = 0;
            let len = arr.length;

            for(; i < len; i++){
                let app = yield getAppVersion(arr[i], aimeejson, installList)
                installList.push(app)
            }

            exports.install(exports.parse(installList))
            console.log('install dependencies done.')
        }
        catch(err){
            gre.error(err.message)
        }
    })
}


// 命令注册核心
exports.reg = function(commander){
    commander
        .command(this.name)
        .alias(this.alias)
        .description(this.description)
        .option('-h, --help', 'output usage information', true)
        .option('-s, --save', 'update aimee.json', true)
        .action(function(argv, options){
            // 检查是否是显示帮助信息
            if(process.argv.indexOf('-h') > 0 || process.argv.indexOf('--help') > 0){
                return exports.outputHelp()
            }

            // 查找配置文件，定位项目位置
            if(!lib.isFile(lib.find('uzconfig.js'))){
                return console.log('error: can\'t find uzconfig.js')
            }

            // 查找配置文件，定位项目位置
            if(!lib.isFile(lib.find('aimee.json'))){
                return console.log('error: can\'t find aimee.json')
            }

            // 检查命令，如果没有指定安装模块则检查是否存在aimee.json
            // @example aimee install
            if(!argv){
                // 安装并且写入依赖关系
                exports.installDependencies()
            }

            // 是否需要更新依赖信息
            if(this.save){
                // 检查是否存在aimee.json
                if(lib.isFile(lib.find('aimee.json'))){
                    // 安装app并更新依赖信息
                    exports.install(true, exports.parse(process.argv.slice(3)));
                }
                else{
                    return console.log('error: can\'t find aimee.json')
                }
            }
            else{
                // 安装app
                exports.install(exports.parse(process.argv.slice(3)));
            }
        })
}

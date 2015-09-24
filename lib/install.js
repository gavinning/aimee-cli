var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var config = require('vpm-config');
var http = require('vpm-http');
var package = require('vpm-package');

exports.name = 'i <appname>';
exports.alias = 'install';
exports.description = 'install aimee app';

// 检查安装条件
exports.zip = function(name, version){
    console.log(path.join(config.get('dir.rep'), name, name + '-' + version + '.zip'))
}

exports.check = function(name){
    var uzconfig, info, filepath;

    // 查找项目配置文件
    uzconfig = lib.find('uzconfig.js');

    // 查找uzconfig配置文件，定位项目位置
    if(!lib.isFile(uzconfig)){
        console.error('Error: can\'t find uzconfig.js')
        return false;
    }

    // 获取项目相关信息
    info = lib.projectInfo(path.dirname(uzconfig));
    // 获取要安装的位置信息
    filepath = path.join(info.modules, name);

    // 检查目标目录是否是非空目录
    if(!lib.isEmpty(filepath)){
        console.log('Error: 安装失败', path.relative(process.cwd(), filepath), '不是非空目录')
        return false;
    }

    return filepath;
}

// 检查缓存
exports.download = function(name, version, fn){
    var zipname = lib.getZipName(name, version);
    var zipsrc = path.join(config.get('dir.rep'), name, zipname);

    console.log(zipname)
    console.log(zipsrc)
}

// 解压到模块到目标目录
exports.package = function(source, target){
    lib.mkdir(target);
    package.unzip(source, target)
    console.log('Install to ' + path.relative(process.cwd(), target), 'success.')
}


/**
 * 安装模块
 * @param   {String}  name 模块名称
 * @param   {String}  src  模块安装路径
 * @example this.install('header', './modules/header');
 */
exports.install = function(name, version, filepath){
    var url;
    var zipname = lib.getZipName(name, version);
    var zipsrc = path.join(config.get('dir.rep'), name, zipname);

    // 检查缓存目录是否已存在该模块
    if(lib.isFile(zipsrc)){
        return exports.package(zipsrc, filepath)
    }

    // 生成下载接口
    url = exports.aimee.url('app', ['name=', name, '&', 'version=', version].join(''));

    // 从服务器安装
    http.download(url, zipsrc, function(e){
        if(e) throw e;
        exports.package(zipsrc, filepath)
    })
}

// 命令注册核心
exports.reg = function(commander){
    commander
        .command(this.name)
        .alias(this.alias)
        .description(this.description)
        // .option('-g, --gloabl [name]', 'install global app', this.page)
        .action(function(name){
            var filepath, arr, version;

            // 检查命令，如果没有指定安装模块则显示帮助信息
            if(name === this){
                return this.outputHelp()
            }

            // 分割版本号
            arr = name.split('@');
            name = arr[0];
            version = arr[1];

            // 检查基础安装条件
            filepath = exports.check(name);

            // 检查安装目录是否存在
            if(!filepath) return;

            // 查询服务器当前模块的相关信息
            exports.aimee.cli.info.query(name, function(err, res, msg){
                var info;

                if(err){
                    return console.log(err.message)
                }

                // 服务器不存在该模块
                if(res.statusCode === 404){
                    return console.log(404 + ' 模块不存在')
                }

                // 查询成功，安装模块的最新版本
                if(res.statusCode === 200){
                    info = JSON.parse(msg);
                    version = version || info.version;

                    // 检查服务器是否存在当前版本
                    if(info.versions.indexOf(version) >= 0){
                        return exports.install(name, version, filepath);
                    }

                    else {
                        lib.rm(filepath);
                        return console.log('404 服务器没有这个版本 ' + version)
                    }
                }

                console.log(res.statusCode, msg);
            })

        })
}


// // 查询服务器当前模块的相关信息
// exports.aimee.cli.info.query(config.name, function(err, res, msg){
//     var info;
//
//     if(err){
//         return console.log(err.message)
//     }
//
//     // 查询成功
//     if(res.statusCode === 200){
//         info = JSON.parse(msg);
//         // 检查该模块是否存在
//         if(info.versions.indexOf(config.version) >= 0){
//             return console.log('Error: 当前版本已存在，请更新版本号')
//         }
//
//         return exports.publish();;
//     }
//
//     // 服务器不存在该模块，满足提交条件
//     if(res.statusCode === 404){
//         return exports.publish();
//     }
//
//     console.log(res.statusCode, msg);
// })

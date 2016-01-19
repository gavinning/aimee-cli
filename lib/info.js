var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var http = require('vpm-http');

exports.name = 'info';
exports.description = 'show aimee app info';

/**
 * 模块信息查询方法
 * @param   {String}   name     要查询的模块名
 * @param   {Function} callback 回调，参数：error, response, msg
 */
exports.query = function(name, callback){
    // 发起查询请求
    http.query(exports.aimee.url('query', 'name=' + name), callback);
}

// 命令注册核心
exports.reg = function(commander){
    commander
        .command(this.name)
        .alias(this.alias)
        .description(this.description)
        .action(function(name){
            // 检查是否存在模块名
            if(name === this){
                return this.outputHelp()
            }

            // 发起查询请求
            exports.query(name, function(err, res, msg){
                // 检查网络异常
                if(err.message === 'connect ECONNREFUSED'){
                    console.log(err.message)
                    console.log(exports.aimee.error.msg[1000])
                    return
                }
                else{
                    return console.log(err.message)
                }

                if(res.statusCode === 200){
                    return console.log(JSON.parse(msg))
                }

                return console.log(res.statusCode, msg)
            });
        })
}

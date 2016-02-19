var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var user = require('vpm-user');
var config = require('vpm-config');
var vpmrc = require('vpm-rc');
var rc = vpmrc('.aimeerc');
var color = require('bash-color');
var Http = require('vpm-http');
var http = Http.instance({'proxy': aimee.rc.core.proxy});

exports.name = 'login';
exports.description = 'user login';
exports.url = config.get('registry.host') + config.get('urls.login');

// 命令注册核心
exports.reg = function(commander){
    commander
        .command(this.name)
        .alias(this.alias)
        .description(this.description)
        .action(function(name){
            // 检查是否已登录
            var username = rc.get('user.name');

            // 检查用户名
            if(username){
                return console.log(username, 'has logged on')
            }

            user.login(function(err, obj){
                if(err) return console.log(err.message);

                http.login(exports.url, obj, function(err, res, msg){
                    var user;
                    // 检查服务器错误
                    if(err){
                        return console.log(color.red('error: ' + err.message))
                    }

                    try{
                        // 格式化msg字符串
                        typeof msg === 'string' ?
                            msg = JSON.parse(msg) : msg;

                        // 检查是否登录成功
                        if(msg.code !== 0){
                            // 抛出错误信息
                            return console.log(color.red('error: ' + msg.message))
                        }
                        else{
                            // 登录成功则赋值user
                            user = msg.data.user;
                        }
                    }
                    catch(e){
                        return console.log(color.red('error: ' + e.message))
                    }

                    // 登录成功
                    if(res.statusCode === 200){
                        // 更新本地配置文件
                        rc.set('user.name', user.name);
                        rc.set('user.auth', user.auth);
                        console.log(obj.username, 'is login')
                    }

                    // 登录失败
                    else {
                        console.log(res.statusCode + ' ' + msg)
                    }
                })
            })
        })
}

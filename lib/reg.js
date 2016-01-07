var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var http = require('vpm-http');
var user = require('vpm-user');
var vpmrc = require('vpm-rc');
var rc = vpmrc('.aimeerc');
var config = require('vpm-config');
var color = require('bash-color');


exports.name = 'reg';
exports.description = 'user reg';
exports.url = config.get('registry.host') + config.get('urls.reg');

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

            user.reg(function(err, obj){
                // 用户取消
                if(err) return console.log(err.message);

                // 验证密码一致性
                if(obj.password !== obj['verify password']){
                    return console.log(color.red('error: 两次密码输入不一致，请重试'))
                }

                // 向服务器提交注册请求
                http.reg(exports.url, obj, function(err, res, msg){
                    var user;
                    // 检查服务器错误
                    if(err){
                        return console.log(color.red('error: ' + err.message))
                    }

                    try{
                        // 格式化msg字符串
                        typeof msg === 'string' ?
                            msg = JSON.parse(msg) : msg;

                        // 检查是否注册成功
                        if(msg.code !== 0){
                            // 抛出错误信息
                            return console.log(color.red('error: ' + msg.message))
                        }
                        else{
                            // 注册成功则赋值user
                            user = msg.data.user;
                        }
                    }
                    catch(e){
                        return console.log(color.red('error: ' + e.message))
                    }

                    // 注册成功
                    if(res.statusCode === 200){
                        // 更新本地配置文件
                        rc.set('user.name', user.name);
                        rc.set('user.auth', user.auth);
                        console.log(obj.username, 'is reg')
                        console.log(obj.username, 'is login')
                    }

                    // 注册失败
                    else {
                        console.log(res.statusCode + ' ' + msg)
                    }
                })
            })
        })
}

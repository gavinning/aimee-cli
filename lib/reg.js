var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var http = require('vpm-http');
var user = require('vpm-user');
var vpmrc = require('vpm-rc');
var rc = vpmrc('.aimeerc');

exports.name = 'reg';
exports.description = 'user reg';

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

                // 获取用户Mac地址
                obj.mac = lib.getMac();

                // 向服务器提交注册请求
                http.reg('http://127.0.0.1:3000/app/aimee/api/reg', obj, function(err, res, msg){
                    // 注册成功
                    if(res.statusCode === 200){
                        // 更新本地配置文件
                        rc.set('user.name', obj.username);
                        rc.set('user.auth', msg)
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

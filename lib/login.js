var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var http = require('vpm-http');
var user = require('vpm-user');
var config = require('vpm-config');
var vpmrc = require('vpm-rc');
var rc = vpmrc('.aimeerc');

exports.name = 'login';
exports.description = 'user login';

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

                http.login(exports.aimee.url('login'), obj, function(err, res, msg){
                    if(res.statusCode === 200){
                        rc.set('user.name', obj.username)
                        rc.set('user.auth', msg)
                        console.log(obj.username, 'is login')
                    }

                    else {
                        console.log(res.statusCode + ' ' + msg)
                    }
                })
            })
        })
}

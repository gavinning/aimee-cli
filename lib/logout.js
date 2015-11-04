var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var http = require('vpm-http');
var user = require('vpm-user');
var vpmrc = require('vpm-rc');
var rc = vpmrc('.aimeerc');

exports.name = 'logout';
exports.description = 'user logout';

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
            if(!username){
                return console.log('No one login')
            }

            rc.set('user', {});
            console.log(username, 'logout success.')
        })
}

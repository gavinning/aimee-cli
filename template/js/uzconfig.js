/*!
 * Config For UZ
 * https://github.com/aimeejs/aimee
 *
 * Aimee-app
 * Date: <%= time %>
 */

fis.config.set('deploy', {
    // 开发环境配置
    dev: {
        // 如果配置了receiver，fis会把文件逐个post到接收端上
        receiver : 'http://domian.com/receiver',
        // 从产出的结果的static目录下找文件
        from : '/',
        // 这个参数会跟随post请求一起发送
        to : 'project/',
        // 通配或正则过滤文件，表示只上传所有的js文件
        include : '*.js',
        // 通配或正则过滤文件，表示不上传所有的json文件
        exclude : '*.json',
        // 支持对文件进行字符串替换
        replace : {
            from : 'http://www.online.com',
            to : 'http://www.offline.com'
        }
    },

    // 发布到本地
    dest: {
        // 从产出的结果的static目录下找文件
        from : '/',
        // 发布指定的文件
        to : 'dest'
    }
});

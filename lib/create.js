var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var config = require('vpm-config');
var color = require('bash-color');
var tree = require('tree-directory');
var charset = 'utf-8';

exports.name = 'c';
exports.alias = 'create';
exports.description = 'create aimee project, page, widget';

// 创建普通Flag关键字
// 例如 Folder、File
exports._flag = ['File', 'Folder'];
exports.flag = function(app){
    // 创建文件夹
    if(app.flag === 'File'){
        fs.writeFileSync(app.path, '', charset);
    }

    // 创建普通文件
    if(app.flag === 'Folder'){
        lib.mkdir(app.path);
    }
}

/**
 * 通过Flag创建文件
 * @param   {String}  src  Flag目标路径
 * @param   {String}  flag Flag，自定义创建标记，从config.create[flag]获取配置，根据配置规则创建文件
 * @example this.createFlag('header', 'app')
 * @example this.createFlag('home', 'page')
 * @example this.createFlag('src/widget/header', 'app')
 * @example this.createFlag('src/pages/home', 'page')
 */
exports.createFlag = function(src, flag){
    var app = {};

    app.path = src;
    app.flag = flag;
    // 获取App名称
    app.name = path.basename(src);
    // 获取App模板配置文件
    app.config = config.get('create')[flag];
    // 创建模板所包含文件
    app.config &&
    app.config.content.length ?
    app.config.content.forEach(function(file){
        // File.name
        file.name = app.name;
        // File.path 替换路径中的File.name
        file.path = file.path.replace(app.config.replace, file.name);
        // File.path 转换绝对路径
        file.path = path.join(app.path, file.path);
        // 创建文件
        file.template ?
            exports.createTemplate(file):
            exports._flag.indexOf(file.flag) >= 0 && file.flag ?
                exports.flag(file): exports.createFlag(file.path, file.flag);
    }):

    // 创建普通Flag关键字
    exports.flag(app);

}

/**
 * 根据模板创建文件
 * @param   {String}  file.name     文件名
 * @param   {String}  file.path     文件路径
 * @param   {String}  file.template 文件模板
 * @example this.template({name: 'app', path: 'app.js', template: 'appjs'})
 */
exports.createTemplate = function(file){
    var data;

    // 获取真实模板地址
    file.tpl = config.get('template')[file.template];
    // 获取模板数据
    data = fs.readFileSync(file.tpl, charset);
    // 获取编译后内容
    data = lib.compile(data, {
        name: file.name,
        time: lib.now('yyyy-mm-dd')
    });
    // 创建文件所在目录
    lib.mkdir(path.dirname(file.path));
    // 写入文件
    fs.writeFileSync(file.path, data, charset);
}

// 分离Flag: [app, page] 创建日志，核心还是 this.createFlag
exports.createApp = function(name, flag){
    exports.createFlag(name, flag)
    console.log(color.blue(name))
    console.log(color.green(tree.sync(name).str))
    console.log('Create', color.purple(flag), color.blue(name), 'success...')
}

// 启动创建项目
exports.project = function(name){
    var folder, project = {};

    if(!name) return console.log('Error: 缺少项目名称');

    project.path = name;
    project.flag = 'project';

    // 检查目标路径是否已存在 | Folder
    if(lib.isDir(project.path)){
        folder = lib.dir(project.path);
        if(folder.files.length || folder.folders.length){
            return console.log('Error: Folder', name, 'is exist, and it is not empty')
        }
    }

    // 检查目标路径是否已存在 | File
    if(lib.isFile(project.path)){
        return console.log('Error: File', name, 'is exist')
    }

    // 交接给创建者
    exports.createFlag(name, project.flag);
    console.log(color.blue(name))
    console.log(color.green(tree.sync(name).str))
    console.log('Create', color.purple(project.flag), color.blue(name), 'success...')
}

// 命令注册入口，必须方法
exports.reg = function(commander){
    commander
        .command(this.name)
        .alias(this.alias)
        .description(this.description)
        .option('-p, --page    [name]', 'create page', this.createApp, 'page')
        .option('-w, --widget  [name]', 'create widget', this.createApp, 'app')
        .action(function(name){
            this.parent.rawArgs.length === 3 && this.outputHelp()
            // Create Project
            if(name !== this){
                exports.project(name)
            }
        })
}

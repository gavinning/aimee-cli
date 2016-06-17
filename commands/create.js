var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var config = require('vpm-config');
var color = require('bash-color');
var tree = require('tree-directory');
var charset = 'utf-8';
var Log = require('../lib/log');
var post = new Log();

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
    // post.log(exports, 199)
    // exports.createFlag(name, flag)

    if(exports.es6){
        exports.createFlag(name, 'es6' + flag)
    }
    else{
        exports.createFlag(name, flag)
    }

    post.log(color.blue(name))
    post.log(color.green(tree.sync(name).str))
    post.log('Create', color.purple(flag), color.blue(name), 'success...')
}

/**
 * 创建项目
 * @param   {String}  name          要创建的项目名称
 * @param   {String}  projectPath   创建项目的根路径
 * @param   {Boolean} silenced      是否以静默模式创建，静默模式不输出日志
 * @example this.project('pro', process.cwd(), true)
 */
exports.project = function(name, projectPath, silenced, fn){
    var folder;
    var project = {};
    var flag = 'project';
    var depend = config.get('create.project.mods');

    if(!name) return post.log('Error: 缺少项目名称');

    // 项目创建路径
    projectPath = projectPath || process.cwd();

    // 检查项目名称为.的情况
    if(name === '.'){
        name = path.basename(projectPath);
        projectPath = path.dirname(projectPath);
    }

    if(typeof silenced === 'function'){
        fn = silenced;
        silenced = false;
    }

    // 静默模式，无日志
    silenced ? post.silenced = true : post.silenced = false;
    fn = fn || function(){};

    // project.path = name;
    project.path = path.join(projectPath, name);
    project.flag = flag;

    // return post.log(project)

    // 检查目标路径是否已存在 | Folder
    if(lib.isDir(project.path)){
        folder = lib.dir(project.path);
        if(folder.files.length || folder.folders.length){
            return post.log('Error: Folder', name, 'is exist, and it is not empty')
        }
    }

    // 检查目标路径是否已存在 | File
    if(lib.isFile(project.path)){
        return post.log('Error: File', name, 'is exist')
    }

    // 交接给创建者
    exports.createFlag(project.path, project.flag);
    post.log('Start create project', color.blue(name) + '...')
    post.log(color.blue(name))
    post.log(color.green(tree.sync(name).str))
    post.log('Start install apps...')

    // 安装依赖模块
    exports.aimee.cli.install.install(exports.aimee.cli.install.parse(depend, path.join(project.path, 'src/modules')),
        function(succ, error, deps){
            // 打印成功信息
            succ.length > 0 && post.log(succ.join('\n'))
            // 打印错误信息
            error.length > 0 && post.log(error.join('\n'))
            // 打印创建成功信息
            post.log('Create', color.purple(project.flag), color.blue(name), 'success...')
            // 尝试更新app依赖信息到project/aimee.json中
            try{
                exports.aimee.cli.install.updateDependencies(path.join(project.path, 'aimee.json'), deps)
            }catch(e){
                post.log(color.red('error: ' + e.message))
            }
            fn();
        }
    );
}

// 命令注册入口，必须方法
exports.reg = function(commander){
    commander
        .command(this.name)
        .alias(this.alias)
        .description(this.description)
        .option('-p, --page    [name]', 'create page', this.createApp, 'page')
        .option('-w, --widget  [name]', 'create widget', this.createApp, 'app')
        .option('-e, --es6', 'use es6 model', function(){
            exports.es6 = true
        })
        .action(function(name){
            this.parent.rawArgs.length === 3 && this.outputHelp()
            // Create Project
            if(name !== this){
                exports.project(name)
            }
        })
}

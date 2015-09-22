var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var config = require('vpm-config');
var color = require('bash-color');

exports.name = 'c';
exports.alias = 'create';
exports.description = 'create aimee app';

// 补足字符串空格
exports.space = function(string){
    var length = 6;

    if(string.length >= length) return string;

    do{
        string += ' ';
    }
    while(string.length < length)

    return string;
}

// 启动创建项目
exports.project = function(name){
    var folder, _config;

    if(!name) return console.log('Error: 缺少项目名称');

    // 获取项目创建配置
    _config = config.get('create.project');
    // 修正项目名称
    _config.name = name;
    // 获取项目创建路径
    _config.path = path.join(process.cwd(), name);

    // 检查目标路径是否已存在 | Folder
    if(lib.isDir(_config.path)){
        folder = lib.dir(_config.path);
        if(folder.files.length || folder.folders.length){
            return console.log('Error: Folder', name, 'is exist, and it is not empty')
        }
    }

    // 检查目标路径是否已存在 | File
    if(lib.isFile(_config.path)){
        return console.log('Error: File', name, 'is exist')
    }

    // 交接给创建者
    exports.aimee.create(_config);
    // Create project name success...
    exports.aimee.log('Create', color.purple(_config.flag), color.green(name), 'success...');
    exports.aimee.log('All process is done.')
}

/**
 * 获取File信息
 * @param   {String}  src  要创建的Aimee对象的文件夹路径
 * @param   {String}  flag 目标类型，要创建的Aimee对象类型：project|page|app
 * @param   {String}  type 文件类型: js|html|jade|less...
 * @return  {Object}       文件的综合信息：type/name/path/template
 * @example [example] this.INFO('/tmp', 'app', '.js')
 */
exports.INFO = function(src, flag, type){
    var obj = {};
    // 文件类型
    obj.type = type;
    // 从文件夹名字推导文件名
    obj.name = path.basename(src);
    // 获取文件路径
    obj.path = path.join(src, obj.name + type);
    obj.template = config.get('template.' + flag + type.replace(/\./g, ''))
    return obj;
}

/**
 * 创建Aimee-app对象，也可以用于创建page对象
 * @param   {String}  src  目标路径
 * @param   {String}  flag 目标类型
 * @example [example] this.app(src, 'app')
 * @example [example] this.app(src, 'page')
 */
exports.app = function(src, flag){
    var imgsrc;
    var arr = [];

    if(!src) return;

    // src不是绝对路径
    if(!path.isAbsolute(src)){
        src = path.join(process.cwd(), src);
    }

    // 创建app文件夹
    lib.mkdir(src);
    // Start create app name
    exports.aimee.log('Create', color.purple(exports.space(flag)), color.green(path.basename(src)))

    // 需要创建的文件
    arr.push(exports.INFO(src, flag, '.js'))
    arr.push(exports.INFO(src, flag, '.jade'))
    arr.push(exports.INFO(src, flag, '.json.js'))
    flag === 'app' && arr.push(exports.INFO(src, flag, '.less'))

    // 创建文件
    arr.forEach(function(item){
        var data, filepath, charset;

        charset = config.get('charset');
        data = fs.readFileSync(item.template, charset);
        // console.log(data, 123)
        data = lib.compile(data, {
            name: item.name,
            time: lib.now('yyyy-mm-dd')
        })

        try{
            fs.writeFileSync(item.path, data, charset);
            // Create File src
            exports.aimee.log('Create', color.purple('File  '), path.relative(process.cwd(), item.path));
        }catch(err){
            throw err;
        }
    })

    // 创建 widget-app 独有内容
    if(flag === 'app'){
        imgsrc = path.join(src, 'img')
        exports.folder(imgsrc)
    }

    // End create app
    // Create app name success...
    exports.aimee.log('Create', color.purple(exports.space(flag)), color.green(path.basename(src)), 'success...')
}

exports.html = function(name){
    if(!name) return;
    // Create type src
    exports.aimee.log('Create', color.purple('File  '), path.relative(process.cwd(), name))
}

exports.folder = function(name){
    if(!name) return;
    lib.mkdir(name)
    // Create type src
    exports.aimee.log('Create', color.purple('Folder'), path.relative(process.cwd(), name))
}

exports.file = function(name){
    if(!name) return;
    // Create type src
    exports.aimee.log('Create', color.purple('File  '), path.relative(process.cwd(), name))
}

// 命令注册入口，必须方法
exports.reg = function(commander){
    commander
        .command(this.name)
        .alias(this.alias)
        .description(this.description)
        .option('-P, --project [name]', 'create project', this.project)
        .option('-p, --page    [name]', 'create page', this.app, 'page')
        .option('-w, --widget  [name]', 'create widget', this.app, 'app')
        .action(function(name){
            this.parent.rawArgs.length === 3 &&
            this.outputHelp()

            if(name !== this){
                exports.project(name);
            }
        })
}

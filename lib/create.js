var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var config = require('vpm-config');

exports.name = 'c';
exports.alias = 'create';
exports.description = 'create aimee app';

// 带有时间戳的日志
exports.log = function(msg){
    var arr = [];
    arr = arr.slice.call(arguments);
    arr.unshift('>');
    arr.unshift(lib.now('hh:mm:ss'));
    console.log.apply(null, arr);
}

exports.project = function(name){
    var folder, _config;

    if(!name) return;

    _config = config.get('create.project');
    _config.name = name;
    _config.path = path.join(process.cwd(), name);

    if(lib.isDir(_config.path)){
        folder = lib.dir(_config.path);
        if(folder.files.length || folder.folders.length){
            return console.log('Error: Folder', name, 'is exist, and it is not empty')
        }
    }

    // 交接给创建者
    exports.aimee.create(_config);
}

// 获取File信息
exports.INFO = function(src, flag, type){
    var obj = {};
    obj.type = type;
    obj.name = path.basename(src);
    obj.path = path.join(src, obj.name + type);
    obj.template = config.get('template.' + flag + type.replace(/\./g, ''))
    return obj;
}

// 创建Aimee-app
// Include Aimee-page
// Include Aimee-widget-app
// this.app(src, 'page')
// this.app(src, 'app')
exports.app = function(src, type){
    var imgsrc;
    var arr = [];

    if(!src) return;

    // src不是绝对路径
    if(!path.isAbsolute(src)){
        src = path.join(process.cwd(), src);
    }

    // 创建app文件夹
    lib.mkdir(src);
    // Start create app
    exports.log('Start create', path.basename(src))

    // 需要创建的文件
    arr.push(exports.INFO(src, type, '.js'))
    arr.push(exports.INFO(src, type, '.jade'))
    arr.push(exports.INFO(src, type, '.json.js'))
    type === 'app' && arr.push(exports.INFO(src, type, '.less'))

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
            exports.log('Create', path.relative(process.cwd(), item.path));
        }catch(err){
            throw err;
        }
    })

    // 创建 widget-app 独有内容
    if(type === 'app'){
        imgsrc = path.join(src, 'img')
        lib.mkdir(imgsrc);
        // Create app/img
        exports.log('Create', path.relative(process.cwd(), imgsrc))
    }

    // End create app
    exports.log('Create', path.basename(src), 'success...')
}

exports.html = function(name){
    if(!name) return;
    console.log('create html', name)
}

exports.folder = function(name){
    if(!name) return;
    lib.mkdir(name)
    console.log('create folder', name)
}

exports.file = function(name){
    if(!name) return;
    console.log('create file', name)
}

exports.reg = function(commander){
    commander
        .command(this.name)
        .alias(this.alias)
        .description(this.description)
        .option('-P, --project [name]', 'create project', this.project)
        .option('-p, --page    [name]', 'create page', this.app, 'page')
        .option('-w, --widget  [name]', 'create widget', this.app, 'app')
        .action(function(){
            this.parent.rawArgs.length === 3 &&
            this.outputHelp()
        })
}

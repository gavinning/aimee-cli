var $ = require('co');
var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var prompt = require('prompt');
var JSONFormat = require('json-format');
var initSchema;

exports.name = 'init';
exports.description = 'create aimee.json';

// clear
prompt.message = '';
prompt.delimiter = '';
prompt.colors = false;

// aimee.json创建程序模板文件
initSchema = [
    {
        name: 'name',
        description: 'name:',
        type: 'string',
        default: path.basename(process.cwd())
    },
    {
        name: 'version',
        description: 'version:',
        type: 'string',
        default: '1.0.0'
    },
    {
        name: 'description',
        description: 'description:',
        type: 'string'
    },
    {
        name: 'repository',
        description: 'git repository:',
        type: 'string'
    },
    {
        name: 'keywords',
        description: 'keywords:',
        type: 'string'
    },
    {
        name: 'author',
        description: 'author:',
        type: 'string'
    }
]

// 返回目标 aimee.json 的路径
exports.target = function(){
    return path.join(process.cwd(), 'aimee.json');
}

// 检查 aimee.json 是否存在
exports.isExist = function(src){
    return lib.isFile(src)
}

// 创建 aimee.json 真实文件
exports.create = function(src, data){
    fs.writeFileSync(src, data, 'utf-8');
}

// 查询本地app，生成依赖对象
exports.findapp = function(){
    var deps = {};
    // 查询本地modules目录
    var modules = lib.getModPath();
    // 查询modules目录下app的配置文件
    var files = lib.dir(modules, {onlyFile: ['aimee.json']}).files;
    // 创建dependencies对象
    files.forEach(function(item){
        try{
            var data = require(item);
            deps[data.name] = exports.aimee.setVersionPrefix(data.version);
        }catch(e){
            throw e;
        }
    })
    return deps;
}

// 创建Aimee app配置文件
function createSchema() {
    return new Promise((resolve, reject) => {
        // 启动aimee.json创建引导程序
        prompt.get(initSchema, function(err, res){
            var ret;

            if (err) reject(err);
            // 检查进程中断
            if (!res) return console.log('Aborted.');

            // 复制 res => ret
            ret = {
                name: res.name,
                version: res.version,
                description: res.description,
                author: res.author
            }

            // 格式化 res.keywords
            // 首先尝试格式化 a, b
            res.keywords.split(/,\s*/).length > 1 ?
                ret.keywords = res.keywords.split(/,\s*/):
                // 失败后再次尝试格式化 a b
                res.keywords.split(' ').length > 1 ?
                    ret.keywords = res.keywords.split(' '):
                    // 失败后直接复制
                    ret.keywords = res.keywords;

            // 格式化 res.repository
            !res.repository ? '' :
                ret.repository = {
                    type: 'git',
                    url: res.repository,
                    bugs: path.join(res.repository.replace(/\.git$/, ''), 'issues')
                }

            resolve(ret)
        })
    })
}

// 确认是否创建
function createSchemaConfirm(ret) {
    return new Promise((resolve, reject) => {
        prompt.get([{
            name: 'sure',
            description: 'It is ok ?:',
            default: 'yes'
        }], function(err, res){
            if (err) reject(err);

            // 检查进程中断
            if (!res || !res.sure) {
                console.log('Aborted.')
            }
            // 创建aimee.json
            else if(res.sure === 'yes'){
                exports.create(exports.target(), ret)
                console.log('success.')
                resolve()
            }
            else{
                console.log('Aborted.')
                resolve()
            }
        })
    })
}

/**
 * 创建 aimee.json
 * @param   {Boolean}  dep  是否更新本地已有app到aimee.json依赖
 * @example this.run()
 * @example this.run(true)
 */
exports.run = dep => {
    $.call(this, function *(){
        try{
            let ret = yield createSchema();
            dep ? ret.dependencies = exports.findapp() : ret;

            // 提示数据结构及目标文件路径
            console.log('')
            console.log('下列数据将会自动写入到(About to write to) :')
            console.log(exports.target())
            console.log('')

            // 美化JSON字符串
            console.log(ret = JSONFormat(ret, {type: 'space', size: 2}))
            console.log('')

            // 询问用户是否确定创建
            yield createSchemaConfirm(ret)
        }
        catch(err){
            console.log('创建失败', err.message)
        }
    })
}

// 命令注册核心
exports.reg = function(commander){
    commander
        .command(this.name)
        .alias(this.alias)
        .description(this.description)
        .option('-s, --save', 'update dependencies', true)
        .action(function(name){
            // 是否已存在aimee.json
            if(exports.isExist(exports.target())){
                return console.log('aimee.json is exist.')
            }

            console.log('当前程序会帮助你创建aimee.json文件.')
            console.log('This utility will walk you through creating an aimee.json file.')
            console.log('Press ^C at any time to quit.')
            console.log('')

            exports.run(this.save);
        })
}

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

// 返回目标 aimee.json的路径
exports.target = function(){
    return path.join(process.cwd(), 'aimee.json');
}

// 检查 aimee.json 是否存在
exports.isExist = function(src){
    return lib.isFile(src)
}

// 创建 aimee.json
exports.create = function(src, data){
    fs.writeFileSync(src, data, 'utf-8');
}

// 格式化数据
exports.parseHandler = function(err, res){
    var ret, _ret;

    // 检查进程中断
    if(!res){
        return console.log('Aborted.')
    }

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
            repository: res.repository,
            bugs: path.join(res.repository.replace(/\.git$/, ''), 'issues')
        }


    // 提示数据结构及目标文件路径
    console.log('')
    console.log('下列数据将会自动写入到(About to write to) :')
    console.log(exports.target())
    console.log('')


    // 美化JSON字符串
    console.log(_ret = JSONFormat(ret, {type: 'space', size: 2}))
    console.log('')
    console.log('')

    // 最后确认是否确定创建aimee.json
    prompt.get([{
        name: 'sure',
        description: 'It is ok ?:',
        default: 'yes'
    }], function(err, result){
        // 检查程序中断
        if(!result || !result.sure){
            console.log('Aborted.')
        }
        // 创建aimee.json
        else if(result.sure === 'yes'){
            exports.create(exports.target(), _ret)
            console.log('success.')
        }
        else{
            console.log('Aborted.')
        }
    });
}

// 更新依赖
exports.update = function(src, data){
    var JSONData;

    // 检查aimee.json是否存在
    if(!exports.isExist(src)){
        return console.log('Can not find aimee.json.')
    }

    // 读取aimee.json
    JSONData = fs.readFileSync(src);
    // 检查JSONData.dependencies是否存在
    JSONData.dependencies = JSONData.dependencies || {};
    // 更新aimee.json
    if(lib.isPlainObject(data)){
        JSONData.dependencies[data.name] = data.version;
    }
    else if(Array.isArray(data)){
        data.forEach(function(item){
            JSONData.dependencies[item.name] = item.version;
        })
    }
    // 写入aimee.json
    exports.create(src, data);
}

// 命令注册核心
exports.reg = function(commander){
    commander
        .command(this.name)
        .alias(this.alias)
        .description(this.description)
        .action(function(name){
            // 是否已存在aimee.json
            if(exports.isExist(exports.target())){
                return console.log('aimee.json is exist.')
            }

            console.log('当前程序会帮助你创建aimee.json文件.')
            console.log('This utility will walk you through creating an aimee.json file.')
            console.log('Press ^C at any time to quit.')
            console.log('')

            // 启动aimee.json创建引导程序
            prompt.get(initSchema, exports.parseHandler);
        })
}

var path = require('path');
var config = require('vpm-config');
var lib = module.exports = require('linco.lab').lib;

lib.extend({

    find: function(file, fn){
        var folder = process.cwd();
        var filepath = path.join(folder, file);
        var fn = fn || function(filepath){ return lib.isFile(filepath) };

        if(lib.isFile(filepath) && fn(filepath)){
            return filepath
        }

        // 当 folder !== '/'
        // 递归向父级查询
        while(folder !== '/'){
            folder = path.dirname(folder);
            filepath = path.join(folder, file);

            // 检查filepath是否存在
            // 检查fn条件是否达成
            if(lib.isFile(filepath) && fn(filepath)) break;
        }

        return lib.isFile(filepath) && fn(filepath) ? filepath : folder;
    },

    projectInfo: function(src){
        return {
            dirname: src,
            pages: path.join(src, 'src', config.get('name.pages')),
            widget: path.join(src, 'src', config.get('name.widget')),
            modules: path.join(src, 'src', config.get('name.modules'))
        }
    }
})

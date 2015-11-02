var path = require('path');
var config = require('vpm-config');
var lib = module.exports = require('linco.lab').lib;

lib.extend({

    // 查找指定文件
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

    // 返回项目信息
    projectInfo: function(src){
        // 检查src是否是文件
        if(lib.isFile(src)){
            src = path.dirname(src)
        }

        // 检查src是否不存在
        // 检查src是否是dir
        if(!src || !lib.isDir(src)){
            return {}
        }

        return {
            dirname: src,
            pages: path.join(src, 'src', config.get('name.pages')),
            widget: path.join(src, 'src', config.get('name.widget')),
            modules: path.join(src, 'src', config.get('name.modules'))
        }
    },

    // 快捷查询Aimee模块位置信息
    getModPath: function(file){
        file = file || 'uzconfig.js';
        return this.projectInfo(this.find(file)).modules;
    },

    /**
     * 返回当前时间，支持格式化
     * @param   {String}  string 格式化公式
     * @return  {String-Number}  返回时间
     * @example this.now()
     * @example this.now('yyyy-mm-dd hh:mm:ss')
     */
    now: function(string){
        var yy, mm, dd, hh, mi, ss, arr, time;

        // 没有格式化规则
        if(!string)
            return Date.now();

        time = new Date();
        arr = string.split(' ');

        if(arr.length === 1){

            if(string.indexOf('y') > 0 || string.indexOf('d') > 0){
                yy = arr[0].match(/y+/);
                mm = arr[0].match(/m+/);
                dd = arr[0].match(/d+/);
            }

            else{
                hh = arr[0].match(/h+/);
                mi = arr[0].match(/m+/);
                ss = arr[0].match(/s+/);
            }
        }

        if(arr.length === 2){
            yy = arr[0].match(/y+/);
            mm = arr[0].match(/m+/);
            dd = arr[0].match(/d+/);

            hh = arr[1].match(/h+/);
            mi = arr[1].match(/m+/);
            ss = arr[1].match(/s+/);
        }

        // For year
        if(yy && yy.length){
            yy = yy[0];
            string = string.replace(yy, time.getFullYear().toString().slice(4-yy.length));
        }

        // For month
        if(mm && mm.length){
            mm = mm[0];
            mm.length === 1 ?
                string = string.replace(mm, time.getMonth()+1):
                string = string.replace(mm, this.format(time.getMonth()+1));
        }

        // For date
        if(dd && dd.length){
            dd = dd[0];
            dd.length === 1 ?
                string = string.replace(dd, time.getDate()):
                string = string.replace(dd, this.format(time.getDate()));
        }

        // For hours
        if(hh && hh.length){
            hh = hh[0];
            hh.length === 1 ?
                string = string.replace(hh, time.getHours()):
                string = string.replace(hh, this.format(time.getHours()));
        }

        // For minutes
        if(mi && mi.length){
            mi = mi[0];
            mi.length === 1 ?
                string = string.replace(mi, time.getMinutes()):
                string = string.replace(mi, this.format(time.getMinutes()));
        }

        // For seconds
        if(ss && ss.length){
            ss = ss[0];
            ss.length === 1 ?
                string = string.replace(ss, time.getSeconds()):
                string = string.replace(ss, this.format(time.getSeconds()));
        }

        return string
    },

    week: function(){
        var arr = '一 二 三 四 五 六 日'.split(' ');
        var weekday = (new Date()).getDay();
        return arr[weekday-1];
    },

    // 格式化单数时间为双数时间
    format: function(num) {
        if (typeof num === 'number') {
            return num < 10 && num > 0 ?
                '0' + String(num) : num;
        }

        else if (typeof num === string) {
            return num.length === 1 ?
                '0' + String(num) : num;
        }

        return num;
    },

    /**
     * 根据毫秒返回小时单位时间
     * ms => d:h:m:s
     * @param   {Number}  num 需要计算毫秒时间
     * @return  {Object}      计算后的时间对象
     * @example this.getTime(10000000)
     */
    getTime: function(num) {
        var d, h, m, s;

        num = Math.floor(num / 1000);

        d = Math.floor(num / 24 / 60 / 60);
        num = num % (24 * 60 * 60);

        h = Math.floor(num / 60 / 60);
        num = num % (60 * 60);

        m = Math.floor(num / 60);
        s = num % 60;

        return {
            d: this.formatTime(d),
            h: this.formatTime(h),
            m: this.formatTime(m),
            s: this.formatTime(s)
        }
    },

    compile: function(tpl, data){
        var flag;
        var reg = /<%=\s*(.+)%>/;
        var regAll = /<%=\s*(.+)%>/gi;
        var arr = tpl.match(regAll);

        arr && arr.forEach(function(item){
            flag = item.match(reg)[1];
            flag = flag.replace(/\s+/g, '');
            tpl = tpl.replace(item, data[flag]);
        })

        return tpl;
    },

    // 检查是否为非空目录
    isEmpty: function(src){
        try{
            var dir = this.dir(src, {deep: false});
            return dir.files.length || dir.folders.length ? false : true;
        }
        catch(e){
            return true
        }
    },

    // 返回当前版本的压缩包名称
    getZipName: function(app){
        return [app.name, '-', app.version, '.zip'].join('')
    },

    getMac: function(){
        var os = require('os');
        var en0 = os.networkInterfaces().en0;
        var ip, mac;

        for(var i=0; i<en0.length; i++){
            if(en0[i].family=='IPv4'){
                ip=en0[i].address;
                mac=en0[i].mac;
            }
        }

        return mac;
    }




























})

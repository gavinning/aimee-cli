Object.prototype.each = Object.prototype.each || function(fn){
    for(var i in this){
        fn.call(this[i], i, this[i]);
    }
}

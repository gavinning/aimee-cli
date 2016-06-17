var Class = require('aimee-class');
var Log = module.exports = Class.create();

var props = (function(){
	var props = [];
	for(var key in console){
		props.push(key)
	}
	return props;
})();

Log.prototype.__init = function(silenced){
	// 静默模式
	this.silenced = silenced || false;
}

props.forEach(function(prop){
	Log.prototype[prop] = function(){
		if(!this.silenced){
			console[prop].apply(console, arguments);
		}
	}
})
const fs = require('fs');
const path = require('path');
const cwd = process.cwd();

module.exports = {
	config: function(){
		return require(cwd + path.sep + 'emily.json');
	},
	all: function(){
		let objModules = this.config().modules,
			arrayModules = [];
		for(let module in objModules){
			arrayModules.push(objModules[module]);
		}
		return arrayModules;
	},
	active: function(){
		return this.all().filter((el)=>el.active);
	},
	inactive: function(){
		return this.all().filter((el)=>!el.active);
	},
	toFilename: function(modules){
		let config = this.config(),
			list = new Array();
		for(let module in config.modules){
			list.push(config.path + '/' + config.modules[module].name + '/');
		}
		return list;
	}
}
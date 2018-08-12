const path = require('path');
const jsonfile = require('jsonfile');
const cwd = process.cwd();

module.exports = {
	config: function(){
		return jsonfile.readFileSync(cwd + path.sep + 'emily.json');
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
	toPaths: function(modules = new Object()){
		let config = this.config(),
			list = new Array();
		for(let module in modules){
			list.push(config.path + '/' + modules[module].name + '/');
		}
		return list;
	}
};
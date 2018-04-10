const config =  require('..').config();
const jsonfile = require('jsonfile');


class Settings{

	static get(){
		return config;
	}

	static set(update){
		config = update;
		Settings.save();
	}

	static getModules(){
		return config.modules;
	}
	static updateModules(obj){
		config.modules = obj;
		Settings.save();
	}

	static getRemotes(){
		return config.remotes;
	}
	static updateRemotes(arr){
		config.remotes = arr;
		Settings.save();
	}

	static getPath(){
		return config.path;
	}

	static save(){
		jsonfile.writeFileSync('emily.json', config, {spaces: 2});
	}
}

module.exports = Settings;
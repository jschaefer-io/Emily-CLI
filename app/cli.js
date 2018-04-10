const colors = require('colors');
const prompt = require('prompt');

class Cli{
	static getModules(){
		return require('./module');
	}
	static getSettings(){
		return require('./settings');
	}

	static getRemotes(){
		return require('./remote');
	}
	
	static getEmptySettings(){
		return {
			path: null,
			modules: {},
			remotes: [],
			defaults: {
				commands: [],
				files: []
			}
		};
	}

	static getRemote(){
		return require('./remote');
	}

	static error(msg, exp = false){
		if (exp) {
			throw new Error(msg);
		}
	}

	static message(msg, exp = true, callback=()=>{}){
		if (exp) {
			callback();
			console.log(msg);
		}
	}

	static success(msg, exp = true, callback=()=>{}){
		if (exp) {
			callback();
			console.log(colors.green(msg));
		}
	}

	static warning(msg, exp = true, callback=()=>{}){
		if (exp) {
			callback();
			console.log(colors.red(msg));
		}
	}

	static prompt(message, fields){
		return new Promise((resolve, reject)=>{
			prompt.message = message;
			prompt.get(fields, (err, result)=>{
				if (err) {
					reject(err);
				}
				resolve(result);
			});
		});
	}
}

module.exports = Cli;
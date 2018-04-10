const Tree = require('./tree');
const Request = require('./request');
const path = require('path');
const config =  require('..').config();

class Remote{

	constructor(name, token, url){
		this.name = name;
		this.token = token;
		this.url = url;
	}

	getTree(module){
		return Tree.getTree(process.cwd() + path.sep + config.path + path.sep + module);
	}

	pullModule(module, version){
		new Request(this.url, this.token, 'GET', module, version).exec().then((res)=>{
			Tree.emergeTree(process.cwd() + path.sep + config.path + path.sep, [res.body]);
		});
	}

	pushModule(module, version){
		new Request(this.url, this.token, 'POST', module, version, this.getTree()).exec().then((res)=>{
			console.log(res.body);
		});
	}

	static getList(){
		if (config.remotes) {
			return config.remotes;
		}
		return [];
	}

	static new(name, url, token){
		return new Remote(name, url, token);
	}

	static get(name){
		let list = Remote.getList();
		let item = Remote.find(name, list);
		return new Remote(item.name, item.token, item.url);
	}

	static find(name){
		let list = Remote.getList();
		return list.find((remote)=>{
			return remote.name === name;
		});
	}

	static exists(name){
		let item = Remote.find(name);
		return item !== undefined;
	}
}

module.exports = Remote;
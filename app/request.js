var request = require('request');

class Request{
	constructor(url, token, method = 'GET', name = false, version = false, tree = false){
		this.url = url;
		this.method = method;
		this.token = token;
		this.name = name;
		this.version = version;
		this.tree = tree;
	}

	getUrl(){
		let url = this.url;
		if (this.name) {
			url += '/' + this.name;
			if (this.version) {
				url += '/' + this.version;
			}
		}
		return url;
	}

	getData(){
		let obj = {};
		if (this.tree) {
			obj.tree = this.tree;
		}
		return obj = JSON.stringify(obj);
	}

	getOptions(){
		return {
			url: this.getUrl(),
			method: this.method,
			headers: {
				'api-key': this.token
			},
			body: {tree: this.tree},
			json: true
		};
	}

	exec(){
		return new Promise((resolve, reject)=>{
			request(this.getOptions(), (err, res)=>{
				if (err) {
					reject(err);
					return;
				}
				resolve(res);
				return;
			});
		});
	}
}

module.exports = Request;
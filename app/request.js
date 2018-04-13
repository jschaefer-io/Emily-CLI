var request = require('request');

class Request{

	/**
	 * Constructor
	 * @param  {String}  url     - Request Url
	 * @param  {String}  token   - api-key
	 * @param  {String}  method  - Request Method
	 * @param  {String} name    - Module name
	 * @param  {String} version - Version string
	 * @param  {Object} tree    - Tree-Object for the given module
	 */
	constructor(url, token, method = 'GET', name = false, version = false, tree = false){
		this.url = url;
		this.method = method;
		this.token = token;
		this.name = name;
		this.version = version;
		this.tree = tree;
	}

	/**
	 * Gets the full built request url
	 * @return {String} full Request url
	 */
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

	/**
	 * Gets the full request options  object
	 * @return {Object} Object containing the Request Options and data
	 */
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

	/**
	 * Executes the Requests
	 * @return {Promise} Promise with the API-Response
	 */
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
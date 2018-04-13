const Tree = require('./tree');
const Request = require('./request');
const path = require('path');
const config =  require('..').config();

class Remote{

	/**
	 * Constructor
	 * @param  {String} name  - Remote name
	 * @param  {String} token - Remote api-key
	 * @param  {String} url   - Remote url
	 */
	constructor(name, token, url){
		this.name = name;
		this.token = token;
		this.url = url;
	}

	/**
	 * Gets the FS-Tree of the given module
	 * @param  {String} module - module name
	 * @return {Array}        Array of tree Objects
	 */
	getTree(module){
		return Tree.getTree(process.cwd() + path.sep + config.path + path.sep + module);
	}

	/**
	 * Pulls the module with the given version from the current remote
	 * @param  {String} module  - module name
	 * @param  {String} version - version string
	 * @return {Promise}         Promise with the API-Response
	 */
	pullModule(module, version){
		return new Promise((resolve, reject)=>{
			new Request(this.url, this.token, 'GET', module, version).exec().then((res)=>{
				if (res.body.error) {
					reject(res.body.message);
					return;
				}
				Tree.emergeTree(process.cwd() + path.sep + config.path + path.sep, [res.body.tree]);
				res.body.version = this.constructor.decodeVersion(res.body.version);
				resolve(res);
			});
		});
	}

	/**
	 * Pushes the module with the given name and version onto the current remote system
	 * @param  {String} module  - module name
	 * @param  {String} version - version string
	 * @return {Promise}         Promise with the API-Response
	 */
	pushModule(module, version){
		return new Promise((resolve, reject)=>{
			new Request(this.url, this.token, 'POST', module, version, this.getTree(module)).exec().then((res)=>{
				if (res.body.error || !res.body.success) {
					reject(res.body.message);
					return;
				}
				resolve(res);
			});
		})
	}

	/**
	 * Encodes the version string for the REST-API
	 * @param  {String} version - Version string
	 * @return {String} the encoded version string: . -> __
	 */
	static encodeVersion(version){
		return version.replace(/\./g,'__');
	}

	/**
	 * Decodes the version string from the REST-API
	 * @param  {String} version - Version string
	 * @return {String} the decoded version string: __ -> .
	 */
	static decodeVersion(version){
		return version.replace(/\_\_/g,'.');
	}

	/**
	 * Returns a list of all registered remotes
	 * @return {Array} Array of remote Objects
	 */
	static getList(){
		if (config.remotes) {
			return config.remotes;
		}
		return [];
	}

	/**
	 * Builds and returns a new Remote
	 * @param  {String} name  - Remote name
	 * @param  {String} token - Remote api-key
	 * @param  {String} url   - Remote url
	 */
	static new(name, url, token){
		return new Remote(name, url, token);
	}

	/**
	 * Gets a Remote Object by name
	 * @param  {String} name - Remote name
	 * @return {Remote} the Remote Object
	 */
	static get(name){
		let item = Remote.find(name);
		return new Remote(item.name, item.token, item.url);
	}

	/**
	 * Fins the Remote emily.json - data by the Remote-name
	 * @param  {String} name - Remote name
	 * @return {Object} Object containing information about the Remote
	 */
	static find(name){
		let list = Remote.getList();
		return list.find((remote)=>{
			return remote.name === name;
		});
	}

	/**
	 * Checks if a remote with the given name exists
	 * @param  {String} name - remote name
	 * @return {Boolean}  returns true if remote exists
	 */
	static exists(name){
		let item = Remote.find(name);
		return item !== undefined;
	}
}

module.exports = Remote;
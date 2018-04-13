const config =  require('..').config();
const jsonfile = require('jsonfile');


class Settings{

	/**
	 * Returns the full emily.json object
	 * @return {Object} full emily settings
	 */
	static get(){
		return config;
	}

	/**
	 * Replaces the emily.json data with the given config object
	 * @param {Object} update - new config Object
	 */
	static set(update){
		config = update;
		Settings.save();
	}

	/**
	 * Gets the module-section from the emily.json
	 * @return {Object} Object containing all modules
	 */
	static getModules(){
		return config.modules;
	}

	/**
	 * Updates the module-section of the emily.json with the given config object
	 * @param  {Object} obj - new modules-object
	 */
	static updateModules(obj){
		config.modules = obj;
		Settings.save();
	}

	/**
	 * Gets the remote-section from the emily.json
	 * @return {Array} list of all remotes
	 */
	static getRemotes(){
		return config.remotes;
	}

	/**
	 * Updates the remote-section of the emily.json with the given remote array
	 * @param  {Array} arr - new remote-array
	 */
	static updateRemotes(arr){
		config.remotes = arr;
		Settings.save();
	}

	/**
	 * Returns the main module-path
	 * @return {String} module path of the emily.json
	 */
	static getPath(){
		return config.path;
	}

	/**
	 * Saves the current config object to the emily.json
	 */
	static save(){
		jsonfile.writeFileSync('emily.json', config, {spaces: 2});
	}
}

module.exports = Settings;
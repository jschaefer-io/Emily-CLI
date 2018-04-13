const colors = require('colors');
const prompt = require('prompt');

class Cli{

	/**
	 * Provies the Module Api
	 * @return {Module.class}
	 */
	static getModules(){
		return require('./module');
	}

	/**
	 * Provides the Settings Api
	 * @return {Settings.class}
	 */
	static getSettings(){
		return require('./settings');
	}

	/**
	 * Provides the Remotes Api
	 * @return {Remote.class}
	 */
	static getRemotes(){
		return require('./remote');
	}

	
	/**
	 * Gets a template for the emily-cm settings object
	 * @return {Object}
	 */
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

	/**
	 * Throws an Error with the given message if the given expression evals to true
	 * @param  {String}  msg - Error Message
	 * @param  {Boolean} exp - throws the Error on true
	 */
	static error(msg, exp = false){
		if (exp) {
			throw new Error(msg);
		}
	}

	/**
	 * Prints a normal console log if the given expression returns to true
	 * @param  {String}   msg      - Message to print
	 * @param  {Boolean}  exp      - Prints the message on true
	 * @param  {Function} callback - Callback called before the message is printed
	 */
	static message(msg, exp = true, callback=()=>{}){
		if (exp) {
			callback();
			console.log(msg);
		}
	}

	/**
	 * Prints a green success message, if the given expression returns to a true
	 * @param  {String}   msg      - Success Message
	 * @param  {Boolean}  exp      - prints the message on true
	 * @param  {Function} callback - Callback called before the message is printed
	 */
	static success(msg, exp = true, callback=()=>{}){
		if (exp) {
			callback();
			console.log(colors.green(msg));
		}
	}

	/**
	 * Prints a red error/warning message, if the given expression returns to a true
	 * @param  {String}   msg      - Error Message
	 * @param  {Boolean}  exp      - prints the message on true
	 * @param  {Function} callback - Callback called before the message is printed
	 */
	static warning(msg, exp = true, callback=()=>{}){
		if (exp) {
			callback();
			console.log(colors.red(msg));
		}
	}

	/**
	 * Promise based wrapper around a Command Line Prompt
	 * @param  {String} message - Message before the prompt
	 * @param  {Array} fields  - Array of objects containing the prompt fields
	 * @return {Promise} Promise with the prompt data
	 */
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
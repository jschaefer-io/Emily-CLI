const path = require('path');
const execa = require('execa');
const fs = require('fs');

const Settings = require('./settings');
const makeDir = require('make-dir');

class Module{

	/**
	 * Constructor
	 * @param  {String} name    - Module Name
	 * @param  {Boolean} active  - true if the module is active
	 */
	constructor(name, active){
		this.name = name;
		this.active = active;
	}

	/**
	 * Checks if the current module is active
	 * @return {Boolean} true if the module is active
	 */
	isActive(){
		return this.active;
	}

	/**
	 * Saves the current module to the emily.json
	 */
	save(){
		let modules = Settings.getModules();
		modules[this.name] = this;
		Settings.updateModules(modules);
	}

	/**
	 * Installs the modules to the module-directory
	 * @param  {Object} options - Options-Object
	 */
	install(options){
		let moduleDir = process.cwd() + path.sep + Settings.getPath() + path.sep + this.name,
			config = Settings.get();
		makeDir.sync(moduleDir);

		if (!options.nofiles) {
			config.defaults.files.forEach((file)=>{
				fs.writeFileSync(moduleDir + path.sep + file.name, file.content.replace(new RegExp('\\$\\{module\\}', 'g'), module));
			});
		}

		if (!options.nocommands) {
			if (config.defaults.commands.length > 0) {
				this.constructor.execArray(config.defaults.commands, moduleDir)
			}
		}
	}

	/**
	 * Activates the current module
	 */
	activate(){
		this.active = true;
	}

	/**
	 * Deactivates the current module
	 */
	deactivate(){
		this.active = false;
	}

	/**
	 * Toggles the current module
	 */
	toggle(){
		if (this.isActive()) {
			this.deactivate();
		}
		else{
			this.activate();
		}
	}

	/**
	 * Executes  the given shell-commands in the given directory
	 * @param  {Array} commands - Array of commands (as strings) to be executed
	 * @param  {String} dir      - Directory to execute the commands
	 */
	static execArray(commands, dir){
		commands.forEach((command)=>{
			execa.shellSync(command, {
				cwd: dir,
				env: process.env,
				stdio: 'inherit'
			});
		});
	}

	/**
	 * Creates a fresh Module Object by name
	 * @param  {String} name - new Object name
	 * @return {Module}      new Module Object
	 */
	static create(name){
		return new Module(name, true);
	}

	/**
	 * Checks if a module with the given name exists already
	 * @param  {String} name - module name to search
	 * @return {Boolean}      returns true if the module exists
	 */
	static exists(name){
		if (Settings.getModules()[name]) {
			return true;
		}
		return false;
	}

	/**
	 * Returns the Module-Object, saved in theModule-Directory by name
	 * @param  {String} name - Module name to search
	 * @return {Module}      Module Object of the installed Module
	 */
	static find(name){
		let base = Settings.getModules()[name];
		return new Module(base.name, base.active);
	}
}

module.exports = Module;
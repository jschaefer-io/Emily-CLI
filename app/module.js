const path = require('path');
const execa = require('execa');

const Settings = require('./settings.js');
const makeDir = require('make-dir');

class Module{
	constructor(name, active, version){
		this.name = name;
		this.active = active;
		this.version = version;
	}

	isActive(){
		return this.active;
	}

	save(){
		let modules = Settings.getModules();
		modules[this.name] = this;
		Settings.updateModules(modules);
	}

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

	activate(){
		this.active = true;
	}

	deactivate(){
		this.active = false;
	}

	toggle(){
		if (this.isActive()) {
			this.deactivate();
		}
		else{
			this.activate();
		}
	}

	static execArray(commands, dir){
		commands.forEach((command)=>{
			execa.shellSync(command, {
				cwd: dir,
				env: process.env,
				stdio: 'inherit'
			});
		});
	}

	static create(name){
		return new Module(name, true, '1.0');
	}

	static exists(name){
		if (Settings.getModules()[name]) {
			return true;
		}
		return false;
	}
	static find(name){
		let base = Settings.getModules()[name];
		return new Module(base.name, base.active, base.version);
	}
	static add(module){
		let modules = Settings.getModules();
		modules[module.name] = module;
		Settings.updateModules(modules);
	}
	static remove(name){
		let modules = Settings.getModules();
		delete modules[name];
		Settings.updateModules(modules);	
	}
}

module.exports = Module;
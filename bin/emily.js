#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const program = require('commander');
const prompt = require('prompt');
const colors = require('colors');

const emily = require('..');
const cwd = process.cwd();
const makeDir = require('make-dir');
const package = require('../' + 'package.json');
const jsonfile = require('jsonfile');
const execa = require('execa');




function writeJson(name, data){
	return new Promise((resolve, reject)=>{
		jsonfile.writeFile(name, data, {spaces: 2}, function (err) {
			if (err) {
				reject(err);
			}
			resolve();
		});
	});
}

function execArray(commands, dir){
	commands.forEach((command)=>{
		execa.shellSync(command, {
			cwd: dir,
			env: process.env,
			stdio: 'inherit'
		});
	});
}


program
  .version(package.version);

program
	.command('init <dir>')
	.description('Initialises the Emily Component Manager')
	.action((dir)=>{

		if (dir.indexOf(path.sep) === 0) {
			console.log(colors.red('Only relative paths allowed.'));
			return;
		}

		let target = dir.replace(/(\\|\/)/g, path.sep);
		if (!fs.existsSync(cwd + path.sep + target)) {
			makeDir.sync(cwd + path.sep + target);
			console.log(colors.green('Directory created.'));
		}
		else if (fs.readdirSync(cwd + path.sep + target).length !== 0) {
			console.log(colors.red('Target directory is not empty.'))
			return;	
		}
		else{
			console.log(colors.green('Directory validated.'));
		}

		prompt.message = colors.blue('Setup');
		prompt.get([
			{
				name: 'command',
				description: colors.yellow('Command to run on component creation:'),
				default: ''
			},
			{
				name: 'files',
				description: colors.yellow('Default filenames in a new component:'),
				default: ''
			}
		], (err, result)=>{
			if (err) {
				throw err;
			}

			let files = [];
			if (result.files.trim() !== '') {
				result.files = result.files.replace(/\s+/g,' ').split(' ').forEach((file)=>{
					files.push({
						name: file,
						content: ''
					});
				});
			}

			let commands = [];
			if (result.command.trim() !== '') {
				commands.push(result.command.trim());
			}

			let json = {
				path: target.replace(path.sep, '/'),
				modules: {},
				defaults: {
					commands: commands,
					files: files
				}
			};
			writeJson('emily.json', json).then(()=>{
				console.log(colors.green('Emily initialized successfully.'));
			});
		});

	});


program
	.command('new <module>')
	.option('-f, --nofiles', 'The default files will not be written in this module.')
	.option('-c, --nocommands', 'The default commands will not be executed in this module.')
	.description('Creates a module with the given name')
	.action(async(module, options)=>{
		let config;
		try{
			config = emily.config();	
		}
		catch(e){
			console.log(colors.red('emily.json not found!'));
			return;
		}
		if (config.modules[module]) {
			console.log(colors.red('Module ') + module + colors.red(' already exists.'));
			return;
		}

		config.modules[module] = {
			name: module,
			active: true,
			repository: ''
		};
		writeJson('emily.json', config);


		let moduleDir = cwd + path.sep + config.path + path.sep + module;
		makeDir.sync(moduleDir);

		if (!options.nofiles) {
			config.defaults.files.forEach((file)=>{
				fs.writeFile(moduleDir + path.sep + file.name, file.content.replace(new RegExp('\\$\\{module\\}', 'g'), module), (e)=>{if (e) throw e;});
			});
		}

		if (!options.nocommands) {
			if (config.defaults.commands.length > 0) {
				await execArray(config.defaults.commands, moduleDir)
			}
		}
	});

program
	.command('toggle <module>')
	.option('-e, --expression', '<module> will be handled as a regular expression')
	.option('-a, --activate', '<module> will be activated no matter the current status')
	.option('-d, --deactivate', '<module> will be deactivated no matter the current status')
	.description('Activates or deactivates the given module')
	.action(async(module, options)=>{
		try{
			config = emily.config();	
		}
		catch(e){
			console.log(colors.red('emily.json not found!'));
			return;
		}

		let toggleModule = (module)=>{
			if (options.activate)
				module.active = true;
			else if(options.deactivate)
				module.active = false;
			else
				module.active = !module.active;
			console.log( colors.blue(module.name) + ' has been ' + ((module.active)?colors.green('activated'):colors.red('deactivated')));
		};

		if (options.expression) {
			let exp = new RegExp(module, 'g'),
				value;
			for(let item in config.modules){
				if (item.match(exp)) {
					toggleModule(config.modules[item]);
				}
			}
		}
		else{
			if (config.modules[module]){
				toggleModule(config.modules[module]);
			}
			else{
				console.log(colors.red('Module could not be found'));
				return;	
			}
		}
		writeJson('emily.json', config);
	});

program
	.command('list')
	.description('Lists all registered modules.')
	.option('-u, --up', 'list only activated modules')
	.option('-d, --down', 'list only deactivated modules')
	.action(async(options)=>{
		try{
			config = emily.config();	
		}
		catch(e){
			console.log(colors.red('emily.json not found!'));
			return;
		}
		let moduleString,
			list = new Array();

		if (options.up) list = list.concat(emily.active())
		if (options.down) list = list.concat(emily.inactive())
		if (!options.up && !options.down) list = list.concat(emily.all());

		list.forEach((module)=>{
			moduleString = ((module.active)?colors.green('activated'):colors.red('deactivated')) + "\t";
			moduleString += colors.blue(module.name);
			console.log(moduleString);
		});
	});

program
	.command('gitinit <git> <name>')
	.description('Creates a new module from its remote repository')
	.action(async(git, name)=>{
		try{
			config = emily.config();	
		}
		catch(e){
			console.log(colors.red('emily.json not found!'));
			return;
		}

		if (config.modules[name]) {
			console.log(colors.red('Module ') + name + colors.red(' already exists.'));
			return;
		}

		config.modules[name] = {
			name: name,
			active: true,
			repository: git
		};
		writeJson('emily.json', config);

		let moduleDir = cwd + path.sep + config.path + path.sep + name;
		execArray(['git clone ' + git + ' ' + moduleDir], cwd);
	});

program
	.command('gitcheckout <module>')
	.option('-e, --expression', '<module> will be handled as a regular expression')
	.description('Pulls the given Module from its repository.')
	.action(async(module, options)=>{
		try{
			config = emily.config();	
		}
		catch(e){
			console.log(colors.red('emily.json not found!'));
			return;
		}

		let checkoutModule = async function(modules, module){
			if (!modules[module]) {
				console.log(colors.red('Module ') + module + colors.red(' could not be found.'));
				return;
			}
			if (modules[module].repository.length === 0) {
				console.log(colors.red('Module ') + module + colors.red(' has no defined repository.'));
				return;
			}
			let moduleDir = cwd + path.sep + config.path + path.sep + module;
			await execArray(['git clone ' + modules[module].repository + ' ' + moduleDir], cwd);
		};

		if (options.expression) {
			let exp = new RegExp(module, 'g');
			for(let item in config.modules){
				if (item.match(exp)) {
					checkoutModule(config.modules, item);
				}
			}
		}
		else{
			checkoutModule(config.modules, module);
		}
		
	});

program
	.command('*')
	.action(async(module)=>{
		console.log(colors.red('Unknown command'));
		program.help();
	});

program.parse(process.argv);

/**
 * No Parameter given -> render help
 */
if (!process.argv.slice(2).length) {
	program.help();
}
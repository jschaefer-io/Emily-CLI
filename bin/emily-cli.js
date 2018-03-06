#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const program = require('commander');
const prompt = require('prompt');
const colors = require('colors');

const emily = require('..');
const cwd = process.cwd();
const mkdir = require('./functions/mkdir');
const execArray = require('./functions/execarray');
const package = require(cwd + path.sep + 'package.json');

program
  .version(package.version);

program
	.command('init <dir>')
	.description('Initialises the Emily Component Manager')
	.action((dir)=>{
		if (dir.indexOf(path.sep) === 0) {
			console.log(colors.red('Only relative paths allowed.'));
			return
		}
		let target = dir.replace(/(\\|\/)/g, path.sep);
		if (!fs.existsSync(cwd + path.sep + target)) {
			mkdir(cwd + path.sep + target);
			console.log(colors.green('Direcoty created.'));
		}
		else if (fs.readdirSync(cwd + path.sep + target).length !== 0) {
			console.log(colors.red('Target directory is not empty.'))
			return;	
		}
		else{
			console.log(colors.green('Direcoty validated.'));
		}

		prompt.message = "config";
		prompt.get([{
			name: 'command',
			description: 'Command to run on component creation',
			default: ''
		},
		{
			name: 'files',
			description: 'Default filenames in a new component',
			default: ''
		}], (err, result)=>{
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
			fs.writeFile('emily.json', JSON.stringify(json, null, 4), (e)=>{
				if (e) {
					throw e;
				}
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

		await fs.writeFile('emily.json', JSON.stringify(config, null, 4), (e)=>{
			if (e) {
				throw e;
			}
		});

		let moduleDir = cwd + path.sep + config.path + path.sep + module;
		mkdir(moduleDir);

		if (!options.nofiles) {
			config.defaults.files.forEach((file)=>{
				fs.writeFile(moduleDir + path.sep + file.name, file.content, (e)=>{if (e) throw e;});
			});
		}

		if (!options.nocommands) {
			if (config.defaults.commands.length > 0) {
				await execArray(config.defaults.commands, moduleDir)
			}
		}
	});

program
	.command('activate <module>')
	.option('-e, --expression', '<module> will be handled as a regular expression')
	.description('Activates the module with the given name')
	.action(async(module, options)=>{
		try{
			config = emily.config();	
		}
		catch(e){
			console.log(colors.red('emily.json not found!'));
			return;
		}
		if (options.expression) {
			let exp = new RegExp(module, 'g');
			for(let item in config.modules){
				if (item.match(exp)) {
					config.modules[item].active = true;
					console.log( item + colors.green(' activated'));
				}
			}
		}
		else{
			if (config.modules[module]) {
				config.modules[module].active = true;
			}
			else{
				console.log(colors.red('Module could not be found'));
			}		
		}
		fs.writeFile('emily.json', JSON.stringify(config, null, 4), (e)=>{if (e) throw e;});
	});

program
	.command('deactivate <module>')
	.option('-e, --expression', '<module> will be handled as a regular expression')
	.description('Deactivates the module with the given name')
	.action(async(module, options)=>{
		try{
			config = emily.config();	
		}
		catch(e){
			console.log(colors.red('emily.json not found!'));
			return;
		}
		if (options.expression) {
			let exp = new RegExp(module, 'g');
			for(let item in config.modules){
				if (item.match(exp)) {
					config.modules[item].active = false;
					console.log( item + colors.red(' activated'));
				}
			}
		}
		else{
			if (config.modules[module]) {
				config.modules[module].active = false;
			}
			else{
				console.log(colors.red('Module could not be found'));
			}		
		}
		fs.writeFile('emily.json', JSON.stringify(config, null, 4), (e)=>{if (e) throw e;});	
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
			moduleString = ((module.active)?colors.green('on'):colors.red('off')) + "\t";
			moduleString += module.name;
			console.log(moduleString);
		});
	});


program.parse(process.argv);

/**
 * No Parameter given -> render help
 */
if (!process.argv.slice(2).length) {
	console.log(program);
	program.help();
}
const fs = require('fs');
const path = require('path');

const program = require('commander');
const prompt = require('prompt');
const colors = require('colors');

const mkdir = require('./functions/mkdir');
const execArray = require('./functions/execarray');
const package = require('./package.json');
const cwd = process.cwd();




 
program
  .version(package.version);

program
	.command('init <dir>')
	.description('Initialises the Emily Component System')
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
			let json = {
				path: target.replace(path.sep, '/'),
				modules: {},
				defaults: {
					commands: [result.command],
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
	.description('Creates a module with the given name')
	.action(async(module)=>{
		let config;
		try{
			config = require('./emily.json');	
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
		await fs.writeFile('./emily.json', JSON.stringify(config, null, 4), (e)=>{
			if (e) {
				throw e;
			}
		});

		let moduleDir = cwd + path.sep + config.path + path.sep + module;
		mkdir(moduleDir);

		config.defaults.files.forEach((file)=>{
			fs.writeFile(moduleDir + path.sep + file.name, file.content, (e)=>{if (e) throw e;});
		});
		if (config.defaults.commands.length > 0) {
			await execArray(config.defaults.commands, moduleDir)
		}
	});

program
	.command('activate <module>')
	.description('Activates the module with the given name')
	.action(async(module)=>{
		try{
			config = require('./emily.json');	
		}
		catch(e){
			console.log(colors.red('emily.json not found!'));
			return;
		}
		if (config.modules[module]) {
			config.modules[module].active = true;
			fs.writeFile('./emily.json', JSON.stringify(config, null, 4), (e)=>{if (e) throw e;});
		}
		else{
			console.log(colors.red('Module could not be found'));
		}		
	});

program
	.command('deactivate <module>')
	.description('Deactivates the module with the given name')
	.action(async(module)=>{
		try{
			config = require('./emily.json');	
		}
		catch(e){
			console.log(colors.red('emily.json not found!'));
			return;
		}
		if (config.modules[module]) {
			config.modules[module].active = false;
			fs.writeFile('./emily.json', JSON.stringify(config, null, 4), (e)=>{if (e) throw e;});
		}
		else{
			console.log(colors.red('Module could not be found'));
		}		
	});

program
	.command('list')
	.description('Lists all modules')
	.action(async(module)=>{
		try{
			config = require('./emily.json');	
		}
		catch(e){
			console.log(colors.red('emily.json not found!'));
			return;
		}

		for(module in config.modules){
			console.log(((config.modules[module].active)?colors.green('on'):colors.red('off'))+ "\t" + config.modules[module].name);
		}
	});

program.parse(process.argv);
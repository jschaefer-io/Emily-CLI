#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const program = require('commander');
const colors = require('colors');

const emily = require('..');
const cwd = process.cwd();
const makeDir = require('make-dir');
const package = require('../' + 'package.json');
const jsonfile = require('jsonfile');

const Cli = require('../app/cli');


program
  .version(package.version);

program
	.command('init <dir>')
	.description('Initialises the Emily Component Manager')
	.action((dir)=>{
		try{

			let target = dir.replace(/(\\|\/)/g, path.sep),
				targetPath = cwd + path.sep + target;

			Cli.error('Only relative paths allowed', target.indexOf(path.sep) === 0);
			Cli.success('Directory created', !fs.existsSync(targetPath), ()=>{
				makeDir.sync(targetPath);
			});
			Cli.error('Target directory is not empty.', fs.readdirSync(targetPath).length > 0);
			Cli.success('Directory validated');

			Cli.prompt(colors.blue('Setup'), [
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
			]).then((result)=>{

				let json = Cli.getEmptySettings();

				if (result.files.trim() !== '') {
					result.files = result.files.replace(/\s+/g,' ').split(' ').forEach((file)=>{
						json.defaults.files.push({
							name: file,
							content: ''
						});
					});
				}

				if (result.command.trim() !== '') {
					json.defaults.commands.push(result.command.trim());
				}

				json.path = target.replace(path.sep, '/');

				jsonfile.writeFileSync('emily.json', json, {spaces: 2});
				Cli.success('Emily initialized successfully');
			});

		} catch(e){
			Cli.warning(e.message);
			return;
		}
	});


program
	.command('new <module>')
	.option('-f, --nofiles', 'The default files will not be written in this module.')
	.option('-c, --nocommands', 'The default commands will not be executed in this module.')
	.description('Creates a module with the given name')
	.action(async(module, options)=>{
		try{

			let Settings = Cli.getSettings();
			let Module = Cli.getModules();
			Cli.error('Module ' + module + ' already exists.', Module.exists(module));

			let newModule = Module.create(module);
			newModule.install(options);
			newModule.save();

		} catch(e){
			Cli.warning(e.message);
			return;
		}
	});

program
	.command('toggle <module>')
	.description('Toggles the given module')
	.action(async(module, options)=>{
		try{

			let Module = Cli.getModules();

			Cli.error('Module ' + module + ' does not exist.', !Module.exists(module));
			
			moduleObj = Module.find(module);
			moduleObj.toggle();
			moduleObj.save();

			Cli.success(moduleObj.name + ' has been ' + ((moduleObj.active)?'activated':'deactivated'));

		} catch(e){
			Cli.warning(e.message);
			return;
		}
	});

program
	.command('list')
	.description('Lists all registered modules.')
	.option('-u, --up', 'list only activated modules')
	.option('-d, --down', 'list only deactivated modules')
	.action(async(options)=>{
		try{
			let Settings = Cli.getSettings();
			let list = [];

			if (options.up) list = list.concat(emily.active())
			if (options.down) list = list.concat(emily.inactive())
			if (!options.up && !options.down) list = list.concat(emily.all());

				list.forEach((module)=>{
					moduleString = ((module.active)?colors.green('activated'):colors.red('deactivated')) + "\t";
					moduleString += colors.blue(module.name);
					console.log(moduleString);
				});

		} catch(e){
			Cli.warning(e.message);
			return;
		}
	});

program
	.command('remote <remote> <url>')
	.description('Adds a remote to the Component Manager')
	.action(async(remote, url)=>{
		try{

			let Settings = Cli.getSettings();
			let Remote = Cli.getRemotes();

			Cli.error('Remote with the name ' + remote + ' does already exist.', Remote.exists(remote));
			Cli.prompt('config', [{name: 'apikey', description: colors.yellow('Remote API-Key')}]).then((results)=>{
				let remotes = Settings.getRemotes();
				remotes.push(new Remote(remote, results.apikey, url));
				Settings.updateRemotes(remotes);
				Cli.success('Remote ' + remote + ' added successfully.');
			});

		} catch(e){
			Cli.warning(e.message);
			return;
		}
	});


program
	.command('pull <remote> <module> [version]')
	.description('Pulls the given Module from the given remote.')
	.action(async(remote, module, version = 'newest')=>{
		try{
			let Settings = Cli.getSettings();
			let Remote = Cli.getRemotes();
			let Module = Cli.getModules();

			Cli.error('Remote with the name ' + remote + ' does not exist.', !Remote.exists(remote));

			let remoteObj = Remote.get(remote);
			await remoteObj.pullModule(module, Remote.encodeVersion(version)).then((res)=>{
				new Module(module, true, res.body.version).save();
				Cli.success('Module ' + module + ' pulled successfully from ' + remote);
			}).catch((e)=>{
				Cli.error(e, true);
			});
		} catch(e){
			Cli.warning(e.message);
			return;
		}
	});

program
	.command('push <remote> <module>')
	.description('Pushes the given Module to the given remote.')
	.action(async(remote, module)=>{
		try{
			let Settings = Cli.getSettings();
			let Remote = Cli.getRemotes();
			let Module = Cli.getModules();

			Cli.error('Remote with the name ' + remote + ' does not exist.', !Remote.exists(remote));
			let version = Module.find(module).version,
				remoteObj = Remote.get(remote);
			await remoteObj.pushModule(module, Remote.encodeVersion(version)).catch((e)=>{
				Cli.error(e, true);
			});

			Cli.success('Module ' + module + ' pushed successfully to ' + remote);

		} catch(e){
			Cli.warning(e.message);
			return;
		}
	});

program
	.command('version <module> <increment>')
	.description('Updates the given modules version number.')
	.action(async(module, increment)=>{
		try{
			let Module = Cli.getModules();

			let increments = ['major','minor','patch'];
			Cli.error('Increment must be one of: ' + increments, increments.indexOf(increment) === -1);
			Cli.error('Module ' + module + ' does not exist.', !Module.exists(module));

			let moduleObj = Module.find(module),
				version = moduleObj.version.split('.');

			switch(increment){
				case 'major':
					if (version[1]) {
						version.splice(1,2);
						version[1] = 0;
					}
					version[0]++;
					break;
				case 'minor':
					if (!version[1]) {version[1] = 0;}
					if (version[2]) {version.splice(2,1);}
					version[1]++;
					break;
				case 'patch':
					if (!version[2]) {version[2] = 0;}
					version[2]++;
					break;
			}
			moduleObj.version = version.join('.');
			moduleObj.save();

			Cli.success('Version of '+ module + ' updated to ' + moduleObj.version);

		} catch(e){
			Cli.warning(e.message);
			return;
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
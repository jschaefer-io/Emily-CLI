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
	.action(async (dir) =>{
        try {
            let target = dir.replace(/(\\|\/)/g, path.sep),
                targetPath = cwd + path.sep + target;

            if (fs.existsSync(cwd + path.sep + 'emily.json')) {
                Cli.message('Emily is already initialized.');
                Cli.message('Reinitializing deletes deletes the emily.json file.');
                await Cli.prompt(colors.blue('Do you want to reinitialize it.'), [
                    {
                        name: 'answer',
                        description: '[y/n]',
                        default: ''
                    }
                ]).then((result) =>{
                    if (result.answer.toLocaleLowerCase() !== 'y') {
                        Cli.error('Initialisation aborted.', true);
                    }
                });
            }

            Cli.error('Only relative paths allowed', target.indexOf(path.sep) === 0);
            Cli.success('Directory created', !fs.existsSync(targetPath), () =>{
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
            ]).then((result) =>{

                let json = Cli.getEmptySettings();

                if (result.files.trim() !== '') {
                    result.files = result.files.replace(/\s+/g, ' ').split(' ').forEach((file) =>{
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

        } catch (e) {
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
const spawn = require('child_process').spawn;

async function execarray(commands, dir, index = 0){
	return new Promise((resolve)=>{
		command = commands[index];	
		command = command.replace(/\s+/g, ' ').split(' ');
		if (command[0] === 'npm') {
			command[0] = 'npm.cmd';
		}
		let proc = spawn(command.splice(0,1).pop(), command, {
			cwd: dir,
			env: process.env,
			stdio: 'inherit'
		});
		proc.on('close', resolve);
	}).then(()=>{
		if (commands[index+1]) {
			execarray(commands, dir, index+1);
		}
	});
}
module.exports = execarray;
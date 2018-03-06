const fs = require('fs');
const path = require('path');
const cwd = process.cwd();

function mkdir(dir, done = cwd){
	dir = dir
			.replace(cwd,'')
			.split(path.sep)
			.filter((el)=>{
				return el.length > 0;
			});	
	done = done + path.sep + dir.splice(0, 1);
	if (!fs.existsSync(done)) {
		fs.mkdirSync(done);
	}
	if (dir.length > 0) {
		mkdir(dir.join(path.sep), done);
	}
};

module.exports = mkdir;
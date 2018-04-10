const fs = require('fs');

class Tree{
	constructor(name, path){
		this.name = name;
		this.path = path;
		this.stat = fs.statSync(this.path);
		this.type = this.setType();
		this.fill();
	}

	fill(){
		if (this.type === 'dir') {
			this.children = this.constructor.getTree(this.path);
		}
		else{
			this.content = fs.readFileSync(this.path).toString('base64');
		}
	}

	isDir(path){
		return this.stat.isDirectory();
	}

	setType(){
		if (this.isDir(this.path)) {
			return 'dir';
		}
		return 'file';
	}

	static getTree(path){
		let tree = fs.readdirSync(path);
		return tree.map((item)=>{
			let newPath = path + '/' + item;
			return new Tree(item, newPath);
		});
	}

	static emergeTree(path, trees){
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
		trees.forEach((tree)=>{
			if (tree.type === 'dir') {
				Tree.emergeTree(path + '/' + tree.name, tree.children);
			}
			else{
				fs.writeFileSync(path + '/' + tree.name, Buffer.from(tree.content, 'base64').toString('utf8'));
			}
		})
	}
}

module.exports = Tree;
const fs = require('fs');

class Tree{

	/**
	 * Constructor
	 * @param  {String} name - file-/dirname
	 * @param  {String} path - path to the file/directory
	 * @return {String}      file or dir , determines the type of element
	 */
	constructor(name, path){
		this.name = name;
		this.path = path;
		this.stat = fs.statSync(this.path);
		this.type = this.setType();
		this.fill();
	}

	/**
	 * Fills the Tree Data with the fitting content depending on its type
	 * dir-types will get its children filled
	 * file-types will get its content filled
	 */
	fill(){
		if (this.type === 'dir') {
			this.children = this.constructor.getTree(this.path);
		}
		else{
			this.content = fs.readFileSync(this.path).toString('base64');
		}
	}

	/**
	 * Checks if the current Tree Object is a directory
	 * @return {Boolean} returns true if the Object is a directory
	 */
	isDir(){
		return this.stat.isDirectory();
	}

	/**
	 * Sets the Item type: dir or file
	 */
	setType(){
		if (this.isDir()) {
			return 'dir';
		}
		return 'file';
	}

	/**
	 * Returns the full fs-tree of the given directory
	 * @param  {String} path - directory path
	 * @return {Tree}      - Tree Object containing the full fs-tree
	 */
	static getTree(path){
		let tree = fs.readdirSync(path);
		return tree.map((item)=>{
			let newPath = path + '/' + item;
			return new Tree(item, newPath);
		});
	}

	/**
	 * Copys the full fs-tree to the given directory
	 * @param  {String} path  - directory path
	 * @param  {Array} trees - array of trees to be copied to the target path
	 */
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
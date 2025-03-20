const path = require("path");
const fs = require("fs");
const zlib = require("zlib");

class LSTreeCommand {
  constructor(flag, sha) {
    this.flag = flag;
    this.sha = sha;
  }
  execute() {
    // read the object sha[0..2] folder, sha[2..] file
    // decompress
    // if output -> if name-only flag, then show only names -> else show whole rows
    const flag = this.flag;
    const sha = this.sha;

    const folder = sha.slice(0, 2);
    const file = sha.slice(2);

    const folderPath = path.join(process.cwd(), ".git", "objects", folder);
    const filePath = path.join(folderPath, file);

    if (!fs.existsSync(folderPath) || !fs.existsSync(filePath))
      throw new Error(`Not a valid object name ${sha}`);

    const fileContent = fs.readFileSync(filePath);
    const outputBuffer = zlib.inflateSync(fileContent);

    const output = outputBuffer.toString().split("\0");
    const treeContent = output.slice(1).filter((e) => e.includes(" "));
    const names = treeContent.map((e) => e.split(" ")[1]);

    names.forEach((name) => process.stdout.write(`${name}\n`));
  }
}

module.exports = LSTreeCommand;

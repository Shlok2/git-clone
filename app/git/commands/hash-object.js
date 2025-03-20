const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const zlib = require("zlib");

class HashObjectCommand {
  constructor(flag, filepath) {
    this.flag = flag;
    this.filepath = filepath;
  }

  execute() {
    // make sure file is there
    // read file
    // create blob (blob <size>\0<content>)
    // calculate hash
    // if -w then write file (also compress)

    const filepath = path.resolve(this.filepath);

    if (!fs.readFileSync(filepath)) {
      throw new Error(
        `could not open ${this.filepath} for reading: No such file or directory `
      );
    }

    const fileContents = fs.readFileSync(filepath);
    const fileLength = fileContents.length;

    const header = `blob ${fileLength}\0`;
    const blob = Buffer.concat([Buffer.from(header), fileContents]);

    const hash = crypto.createHash("sha1").update(blob).digest("hex");

    if (this.flag && this.flag === "-w") {
      const folder = hash.slice(0, 2);
      const file = hash.slice(2);

      const completeFolderPath = path.join(
        process.cwd(),
        ".git",
        "objects",
        folder
      );

      if (!fs.existsSync(completeFolderPath)) {
        fs.mkdirSync(completeFolderPath);
      }

      const compressedData = zlib.deflateSync(blob);

      fs.writeFileSync(path.join(completeFolderPath, file), compressedData);
    }

    process.stdout.write(hash);
  }
}

module.exports = HashObjectCommand;

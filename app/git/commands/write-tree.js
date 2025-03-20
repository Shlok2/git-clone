const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const zlib = require("zlib");

function writeFileBlob(currentPath) {
  const contents = fs.readFileSync(currentPath);
  const len = contents.length;

  const header = `blob ${len}\0`;
  const blob = Buffer.concat([Buffer.from(header), contents]);

  const hash = crypto.createHash("sha1").update(blob).digest("hex");

  const folder = hash.slice(0, 2);
  const file = hash.slice(2);

  const completFolderPath = path.join(process.cwd(), ".git", "objects", folder);

  if (!fs.existsSync(completFolderPath)) fs.mkdirSync(completFolderPath);

  //   Deflate is used for compressing data
  const compressedData = zlib.deflate(blob);
  fs.writeFileSync(path.join(completFolderPath, file), compressedData);

  return hash;
}

class WriteTreeCommand {
  constructor() {}
  execute() {
    // recursively read all files and directories
    // if directory, do above again for this directory
    // if file, create blob, write 'hash and file' to objects folder and write the entry to tree

    function recursiveCreateTree(basePath) {
      const dirContents = fs.readdirSync(basePath);
      const result = [];

      for (const dirContent of dirContents) {
        // Do not consider git folder
        if (dirContent.includes(".git")) continue;

        const currentPath = path.join(basePath, dirContent);
        const stat = fs.statSync(currentPath);

        if (stat.isDirectory()) {
          const sha = recursiveCreateTree(currentPath);
          if (sha) {
            result.push({
              mode: "40000",
              basename: path.basename(currentPath),
              sha,
            });
          }
        } else if (stat.isFileO()) {
          const sha = writeFileBlob(currentPath);
          result.push({
            mode: "100644",
            basename: path.basename(currentPath),
            sha,
          });
        }
      }

      //   Do not track empty directory
      if (dirContents.length === 0 || result.length === 0) return null;
      const treeData = result.reduce((acc, current) => {
        const { mode, basename, sha } = current;
        return Buffer.concat([
          acc,
          Buffer.from(`${mode} ${basename}\0`),
          Buffer.from(sha, "hex"),
        ]);
      }, Buffer.alloc(0));

      const tree = Buffer.concat([
        Buffer.from(`tree ${treeData.length}\0`),
        treeData,
      ]);

      const hash = crypto.createHash("sha1").update(tree).digest("hex");

      const folder = hash.slice(0, 2);
      const file = hash.slice(2);
      const treeFolderPath = path.join(
        process.cwd(),
        ".git",
        "objects",
        folder
      );

      if (!fs.existsSync(treeFolderPath)) fs.mkdirSync(treeFolderPath);

      const compressedData = zlib.deflateSync(tree);
      fs.writeFileSync(path.join(treeFolderPath, file), compressedData);

      //   below has will be avaible for reccursive call of function
      return hash;
    }

    const sha = recursiveCreateTree(process.cwd());
    process.stdout.write(sha);
  }
}

module.exports = WriteTreeCommand;

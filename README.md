The entry point for your Git implementation is in `app/main.js`. Study and
uncomment the relevant code, and push your changes to pass the first stage:

Note: This section is for stages 2 and beyond.

1. Ensure you have `node (21)` installed locally
1. Run `./your_program.sh` to run your Git implementation, which is implemented
   in `app/main.js`.

# Testing locally

The `your_program.sh` script is expected to operate on the `.git` folder inside
the current working directory. If you're running this inside the root of this
repository, you might end up accidentally damaging your repository's `.git`
folder.

execute `your_program.sh` in a different folder when testing
locally. For example:

```sh
mkdir -p /tmp/testing && cd /tmp/testing
/path/to/your/repo/your_program.sh init
```

To make this easier to type out, you could add a
[shell alias](https://shapeshed.com/unix-alias/):

```sh
alias mygit=/path/to/your/repo/your_program.sh

mkdir -p /tmp/testing && cd /tmp/testing
mygit init
```

# Git Commands overview

1. git cat-file -p 8d912c3034e84b712b71b2bfd7cd5ece3993282f -> It shows the information about the commit (like who created it
   and more...) -> go to objects folder > 8d folder (first two letters) > cat and consoles 912c3034e84b712b71b2bfd7cd5ece3993282f
   files content.

   BLOB -> <size>\0<content>
   sha(hash) -> hash(blob)

2. git hash-object file_path(package.json) -> gives the SHA for that file -> SHA is "hash(<size>\0<content>)"
   git hash-object -w file_path -> create a SHA file in git/objects/[0..2]/[2..]

3. git ls-tree 8d912c3034e84b712b71b2bfd7cd5ece3993282f -> gives the files changed (consists of blobs and trees)
   --name-only -> flag will show only the names of files changed

4. git write-tree -> (something like git add) -> output is a sha of tree object written to .git/objects
   iterate over folder/files in currect working directory -> if file, then create blob object and record its sha
   if folder, then reccursively create a tree and record its sha
   after having all entries -> write tree object to .git/objects directory

5. git commit-tree <tree_sha> -p <commit_sha> -m 'Initial commit' -> (something like git commit)
   commit_sha -> (which we got from git write-tree command)

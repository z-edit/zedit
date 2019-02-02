ngapp.service('fileTreeService', function() {
    let service = this,
        files = {},
        trees = {};

    let findFolder = function(parent, name) {
        return parent.children.find(child => {
            return child.name.equals(name, true);
        });
    };

    let getTargetIndex = function(parent, name) {
        let n = parent.children.findIndex(child => child.name > name);
        if (n > -1) return n;
        return parent.children.length;
    };

    let addFolder = function(parent, name) {
        let targetIndex = getTargetIndex(parent, name),
            folder = { parent, name, type: 'folder', children: [] };
        parent.children.splice(targetIndex, 0, folder);
        return folder;
    };

    let addFolders = function(tree, folders) {
        return folders.forEach((currentFolder, name) => {
            return findFolder(currentFolder, name) ||
                addFolder(currentFolder, name);
        }, tree);
    };

    let addFile = function(folder, name, filePath) {
        let ext = fh.getFileExt(name);
        folder.children.push({ name, filePath, type: 'file', ext });
    };

    let buildFileTree = function(folder) {
        let files = service.getFiles(folder);
        return files.reduce((tree, filePath) => {
            let folders = filePath.split('\\'),
                filename = folders.pop(),
                folder = addFolders(tree, folders);
            addFile(folder, filename, filePath);
            return tree;
        }, { children: [] });
    };

    this.getFiles = function(folder) {
        if (!files.hasOwnProperty(folder))
            files[folder] = xelib.GetContainerFiles('', folder);
        return files[folder];
    };

    this.getFileTree = function(folder) {
        if (!trees.hasOwnProperty(folder))
            trees[folder] = buildFileTree(folder);
        return trees[folder];
    };

    this.resolvePath = function(tree, path) {
        if (path === '') return tree;
        let folders = path.split('\\');
        return folders.reduce((currentFolder, folder) => {
            let nextFolder = findFolder(currentFolder, folder);
            if (!nextFolder)
                throw new Error(`Could not find folder ${folder}`);
            return nextFolder;
        }, tree);
    };
});

import { remote, shell } from 'electron';
import jetpack from 'fs-jetpack';
import minimatch from 'minimatch'
import extract from 'extract-zip';
import url from 'url';

let fh = {};

fh.jetpack = jetpack;
fh.minimatch = minimatch;
fh.appPath = remote.app.getAppPath();
fh.userPath = remote.app.getPath('userData');
fh.userDir = jetpack.cwd(fh.userPath);
fh.appDir = jetpack.cwd(fh.appPath);

// log app directory for reference
console.log('App directory: ' + fh.appPath);

// helper function for loading json file
fh.loadJsonFile = function(filePath) {
    if (fh.jetpack.exists(filePath) === 'file') {
        return fh.jetpack.read(filePath, 'json');
    }
};

fh.loadTextFile = function(filePath) {
    if (fh.jetpack.exists(filePath) === 'file') {
        return fh.jetpack.read(filePath);
    }
};

fh.loadResource = function(filePath) {
    let format = filePath.endsWith('.json') ? 'json' : 'utf8';
    if (fh.appDir.exists(filePath) === 'file') {
        return fh.appDir.read(filePath, format);
    }
};

// helper function for saving json files
fh.saveJsonFile = function(filePath, value, minify = false) {
    fh.jetpack.write(filePath, minify ? JSON.stringify(value) : value);
};

fh.saveTextFile = function(filePath, value) {
    fh.jetpack.write(filePath, value);
};

fh.openFile = function(filePath) {
    if (fh.jetpack.exists(filePath)) {
        shell.openItem(fh.jetpack.path(filePath));
    }
};

fh.openUrl = function(url) {
    shell.openItem(url);
};

fh.pathToFileUrl = function(path) {
    return url.format({
        pathname: jetpack.path(path).replace(/\\/g, '/'),
        protocol: 'file:',
        slashes: true
    })
};

fh.fileUrlToPath = function(fileUrl) {
    return fileUrl.startsWith('file:///') && fileUrl.slice(8);
};

fh.extractArchive = function(filePath, destDir, empty = false) {
    fh.jetpack.dir(destDir, { empty: empty });
    extract(filePath, { dir: destDir }, (err) => { throw err });
};

fh.getFileBase = function(filePath) {
    return filePath.match(/(.*\\)?(.*)\.[^\\]+/)[2];
};

fh.getFileExt = function(filePath) {
    return filePath.match(/(.*\\)?.*\.([^\\]+)/)[2];
};

fh.getFileName = function(filePath) {
    return filePath.match(/(.*\\)?(.*)/)[2];
};

fh.getDirectory = function(filePath) {
    return filePath.match(/(.*)\\.*/)[1];
};

fh.getDateModified = function(filePath) {
    return fh.jetpack.inspect(filePath, {times: true}).modifyTime;
};

fh.getFileSize = function(filePath) {
    return fh.jetpack.inspect(filePath).size;
};

fh.getDirectories = function(path) {
    return fh.jetpack.find(path, {
        matching: '*',
        files: false,
        directories: true,
        recursive: false
    });
};

fh.getFiles = function(path, options) {
    if (fh.jetpack.exists(path) !== 'dir') return [];
    return fh.jetpack.find(path, options);
};

fh.filterExists = function(folder, paths) {
    return paths.filter(function(path) {
        return fh.jetpack.exists(`${folder}/${path}`);
    });
};

// helper function for selecting a directory
fh.selectDirectory = function(title, defaultPath) {
    let selection = remote.dialog.showOpenDialog({
        title: title,
        defaultPath: defaultPath,
        properties: ['openDirectory']
    });
    return selection && selection[0];
};

// helper function for selecting a theme
fh.selectFile = function(title, defaultPath, filters = []) {
    let selection = remote.dialog.showOpenDialog({
        title: title,
        defaultPath: defaultPath,
        filters: filters,
        properties: ['openFile']
    });
    return selection && selection[0];
};

fh.saveFile = function(title, defaultPath, filters = []) {
    return remote.dialog.showSaveDialog({
        title: title,
        defaultPath: defaultPath,
        filters: filters
    });
};

export default fh;

import { remote, shell } from 'electron';
import jetpack from 'fs-jetpack';
import minimatch from 'minimatch'
import md5file from 'md5-file';
import zip from 'adm-zip';
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
    if (jetpack.exists(filePath) === 'file') {
        return jetpack.read(filePath, 'json');
    }
};

fh.loadTextFile = function(filePath) {
    if (jetpack.exists(filePath) === 'file')
        return jetpack.read(filePath);
};

fh.loadResource = function(filePath) {
    let format = filePath.endsWith('.json') ? 'json' : 'utf8';
    if (fh.appDir.exists(filePath) === 'file')
        return fh.appDir.read(filePath, format);
};

// helper function for saving json files
fh.saveJsonFile = function(filePath, value, minify = false) {
    jetpack.write(filePath, minify ? JSON.stringify(value) : value);
};

fh.saveTextFile = function(filePath, value) {
    jetpack.write(filePath, value);
};

fh.openFile = function(filePath) {
    if (jetpack.exists(filePath))
        shell.openItem(jetpack.path(filePath));
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
    jetpack.dir(destDir, { empty: empty });
    zip(filePath).extractAllTo(destDir, true);
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
    return jetpack.inspect(filePath, {times: true}).modifyTime;
};

fh.getFileSize = function(filePath) {
    return fh.jetpack.inspect(filePath).size;
};

fh.getMd5Hash = function(filePath) {
    if (fh.jetpack.exists(filePath) !== 'file') return;
    return md5file.sync(filePath);
};

fh.getDirectories = function(path) {
    if (fh.jetpack.exists(path) !== 'dir') return [];
    return jetpack.find(path, {
        matching: '*',
        files: false,
        directories: true,
        recursive: false
    }).map(path => jetpack.path(path));
};

fh.getFiles = function(path, options) {
    if (fh.jetpack.exists(path) !== 'dir') return [];
    return fh.jetpack.find(path, options)
        .map(path => fh.jetpack.path(path));
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

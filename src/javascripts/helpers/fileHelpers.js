import { remote, shell } from 'electron';
import jetpack from 'fs-jetpack';
import minimatch from 'minimatch';
import { enumerateValues, HKEY } from 'registry-js';
import md5file from 'md5-file';
import zip from 'adm-zip';
import url from 'url';
import path from 'path';
import fs from 'fs';
import {Ini} from 'ini-api';

let fh = {};

let escapeChars = ['*', '#', '!', '(', ')', '[', ']', '{', '}', '+', '|'];

fh.jetpack = jetpack;
fh.minimatch = minimatch;
fh.appPath = remote.app.getAppPath();
fh.userPath = remote.app.getPath('userData');
fh.userDir = jetpack.cwd(fh.userPath);
fh.appDir = jetpack.cwd(fh.appPath);

fh.normalize = path.normalize;
fh.path = jetpack.path;

// log app directory for reference
console.log('App directory: ' + fh.appPath);

fh.directoryExists = function(path) {
    try {
        return jetpack.exists(path) === 'dir';
    } catch (x) {
        return false;
    }
};

fh.fileExists = function(path) {
    try {
        return jetpack.exists(path) === 'file';
    } catch (x) {
        return false;
    }
};

fh.loadJsonFile = function(filePath) {
    if (jetpack.exists(filePath) === 'file')
        return jetpack.read(filePath, 'json');
};

fh.loadTextFile = function(filePath, encoding = 'utf8') {
    if (jetpack.exists(filePath) !== 'file') return;
    return fs.readFileSync(filePath, { encoding });
};

fh.loadResource = function(filePath) {
    let format = filePath.endsWith('.json') ? 'json' : 'utf8';
    if (fh.appDir.exists(filePath) === 'file')
        return fh.appDir.read(filePath, format);
};

fh.loadIni = function(filePath) {
    let text = fh.loadTextFile(filePath);
    return text && new Ini(text);
};

fh.saveJsonFile = function(filePath, value, minify = false) {
    jetpack.write(filePath, minify ? JSON.stringify(value) : value);
};

fh.saveTextFile = function(filePath, value, encoding = 'utf8') {
    jetpack.dir(fh.getDirectory(filePath));
    fs.writeFileSync(filePath, value, { encoding });
};

fh.deleteEmptyFolders = function(folder) {
    let canDelete = true;
    jetpack.list(folder).forEach(filename => {
        let filePath = fh.path(folder, filename),
            isDir = jetpack.exists(filePath) === 'dir';
        canDelete = isDir && fh.deleteEmptyFolders(filePath) && canDelete;
    });
    if (canDelete) jetpack.remove(folder);
    return canDelete;
};

fh.delete = function(path) {
    if (!fs.existsSync(path)) return;
    let isDir = fs.lstatSync(path).isDirectory();
    if (!isDir) return fs.unlinkSync(path);
    fs.readdirSync(path).forEach(file => {
        fh.delete(path + '/' + file);
    });
    try { fs.rmdirSync(path) } catch (x) {}
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

fh.escapePattern = function(p) {
    return p.split('').map(char => {
        if (escapeChars.includes(char)) return '\\' + char;
        if (char === '\\') return '/';
        return char;
    }).join('');
};

fh.extractArchive = function(filePath, destDir, empty = false) {
    jetpack.dir(destDir, { empty: empty });
    zip(filePath).extractAllTo(destDir, true);
};

fh.getFileBase = function(filePath) {
    return filePath.match(/(.*[\\\/])?(.*)\.[^\\\/]+/)[2];
};

fh.getFileExt = function(filePath) {
    return filePath.match(/(.*[\\\/])?.*\.([^\\\/]+)/)[2];
};

fh.getFileName = function(filePath) {
    return filePath.match(/(.*[\\\/])?(.*)/)[2];
};

fh.getDirectory = function(filePath) {
    return filePath.match(/(.*)[\\\/].*/)[1];
};

fh.getDateModified = function(filePath) {
    return jetpack.inspect(filePath, {times: true}).modifyTime;
};

fh.getFileSize = function(filePath) {
    return jetpack.inspect(filePath).size;
};

fh.getMd5Hash = function(filePath) {
    if (jetpack.exists(filePath) !== 'file') return;
    return md5file.sync(filePath);
};

fh.getDirectories = function(path) {
    if (jetpack.exists(path) !== 'dir') return [];
    return jetpack.find(path, {
        matching: '*',
        files: false,
        directories: true,
        recursive: false
    }).map(path => jetpack.path(path));
};

fh.getFiles = function(path, options) {
    if (jetpack.exists(path) !== 'dir') return [];
    if (!options.hasOwnProperty('ignoreCase'))
        options.ignoreCase = true;
    return jetpack.find(path, options)
        .map(path => jetpack.path(path));
};

fh.filterExists = function(folder, paths) {
    return paths.filter(path => {
        return jetpack.exists(`${folder}/${path}`);
    });
};

fh.getRegistryValues = function(hkey, path) {
    return enumerateValues(HKEY[hkey], path);
};

// helper function for selecting a directory
fh.selectDirectory = function(title, defaultPath) {
    let selection = remote.dialog.showOpenDialogSync({
        title: title,
        defaultPath: defaultPath,
        properties: ['openDirectory']
    });
    return selection && selection[0];
};

fh.selectFile = function(title, defaultPath, filters = []) {
    let selection = remote.dialog.showOpenDialogSync({
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

import { remote } from 'electron';
import jetpack from 'fs-jetpack';

let fh = {};

fh.jetpack = jetpack;
fh.appPath = remote.app.getAppPath();
fh.userPath = remote.app.getPath('userData') + '\\';
fh.appDir = jetpack.cwd(fh.appPath);

// log app directory for reference
console.log('App directory: ' + fh.appPath);

// helper function for loading json file
fh.loadJsonFile = function(filename, defaultValue = []) {
    if (fh.jetpack.exists(filename) === 'file') {
        return fh.jetpack.read(filename, 'json');
    } else {
        return defaultValue;
    }
};

fh.loadTextFile = function(filename, defaultValue = '') {
    if (fh.jetpack.exists(filename) === 'file') {
        return fh.jetpack.read(filename);
    } else {
        return defaultValue;
    }
};

fh.loadResource = function(filename, defaultValue = []) {
    if (fh.appDir.exists(filename) === 'file') {
        return fh.appDir.read(filename, 'json');
    } else {
        return defaultValue;
    }
};

// helper function for saving json files
fh.saveJsonFile = function(filename, value, minify = false) {
    fh.jetpack.write(filename, minify ? JSON.stringify(value) : value);
};

fh.saveTextFile = function(filename, value) {
    fh.jetpack.write(filename, value);
};

fh.getDateModified = function(filename) {
    return fh.jetpack.inspect(filename, {times: true}).modifyTime;
};

// helper function for selecting a directory
fh.selectDirectory = function(title, defaultPath) {
    let selection = remote.dialog.showOpenDialog({
        title: title,
        defaultPath: defaultPath,
        properties: ['openDirectory']
    });
    if (!selection) return defaultPath;
    return selection[0];
};

export default fh;

ngapp.service('fileSearchService', function() {
    let fs = require('fs'),
        driveLetters = require('windows-drive-letters'),
        diskUsage = require('diskusage');

    let searchExpr, queue, start, prioritize,
        maxPriority, timeout, drives;

    let getDiskUsage = function(path) {
        try {
            return diskUsage.checkSync(path);
        } catch (x) {}
    };

    let getDrives = function() {
        let drives = driveLetters.usedLettersSync();
        return drives.reduce((a, drive) => {
            let usage = getDiskUsage(`${drive}:`);
            if (usage) a.push(Object.assign({
                path: `${drive}:`
            }, usage));
            return a;
        }, []).sortOnKey('total');
    };

    let initSearch = function(expr, opts) {
        searchExpr = expr;
        queue = opts.initalQueue || [];
        start = new Date();
        prioritize = opts.prioritize || [];
        maxPriority = prioritize.length;
        timeout = opts.timeout || 1000;
        drives = drives || getDrives();
    };

    let checkTimeout = () => {
        if (new Date() - start > timeout)
            throw new Error('Timeout exceeded.');
    };

    let matchesSearch = filename => searchExpr.test(filename);

    let getFiles = function(path) {
        try {
            return fs.readdirSync(path).filter(f => {
                try {
                    let stats = fs.statSync(`${path}\\${f}`);
                    return !stats.isDirectory();
                } catch (x) {}
            });
        } catch(x) {
            return [];
        }
    };

    let getDirectories = function(path) {
        try {
            return fs.readdirSync(path + '\\').filter(f => {
                try {
                    let stats = fs.statSync(`${path}\\${f}`);
                    return stats.isDirectory();
                } catch (x) {}
            });
        } catch(x) {
            return [];
        }
    };

    let search = function(path) {
        checkTimeout();
        console.log('Searching ', path);
        let files = getFiles(path),
            foundFile = files.find(matchesSearch);
        if (foundFile) return `${path}\\${foundFile}`;
        let dirs = getDirectories(path);
        dirs.forEach(dir => enqueuePath(`${path}\\${dir}`, dir));
    };

    let enqueueEntry = function(entry) {
        let index = queue.findIndex(item => {
            return item.priority < entry.priority;
        });
        if (index === -1) index = queue.length;
        queue.splice(index, 0, entry);
    };

    let enqueuePath = function(path, filename = '', base = 0) {
        let p = prioritize.findIndex(p => p.test(filename)),
            priority =  base + (p === -1 ? 0 : maxPriority - p);
        enqueueEntry({ priority, path });
    };

    this.findFile = function(expr, opts = {}) {
        initSearch(expr, opts);
        try {
            drives.forEach(drive => enqueuePath(drive.path, '', 100));
            let nextEntry;
            while (nextEntry = queue.shift()) {
                if (!nextEntry.path) continue;
                let foundPath = search(nextEntry.path);
                if (foundPath) return foundPath;
            }
        } catch(x) {
            if (x.message !== 'Timeout exceeded.') console.error(x);
        }
        return '';
    }
});

ngapp.run(function(interApiService, fileSearchService) {
    interApiService.register({ api: {fileSearchService} });
});
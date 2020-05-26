ngapp.service('relinker', function(scriptsCache, bsaHelpers, pexService, settingsService, mergeService, progressLogger, gameService) {
    let {log, warn, progress} = progressLogger,
        opcodes = require('pex-parser/src/opcodes.js');

    const CALLSTATIC = opcodes.findByKey('name', 'callstatic');

    let getMergedPlugins = function(merges) {
        let mergedPlugins = {};
        merges.forEach(merge => {
            merge.plugins.forEach(({filename}) => {
                mergedPlugins[filename] = merge.filename;
            });
        });
        return mergedPlugins;
    };

    let getScriptsToRelink = function(merges) {
        progress('Getting scripts to relink', true);
        let cache = scriptsCache.update(),
            mergedPlugins = getMergedPlugins(merges);
        return cache.filter(entry => {
            return !!entry.fileRefs.find(file => {
                return mergedPlugins.hasOwnProperty(file);
            });
        });
    };

    let getScriptFilePath = function(entry) {
        let basePath = `scripts\\${entry.filename}`;
        return entry.bsa ? bsaHelpers.extractFile(entry.bsa, basePath) :
            fh.path(gameService.dataPath, basePath);
    };

    let buildFormIdMap = function(merges) {
        progress('Building Form ID map');
        return merges.reduce((fidMap, merge) => {
            log(`Loading FormID map for ${merge.name}`);
            let mergeFolderPath = mergeService.getMergeFolder(merge),
                path = fh.path(mergeFolderPath, 'map.json'),
                map = fh.loadJsonFile(path);
            if (!map) warn(`Form ID map for ${merge.name} not found at ${path}`);
            return Object.assign(fidMap, map || {});
        }, {});
    };

    let resolveString = function(script, arg) {
        return script.stringTable[arg.data];
    };

    let fixGetFormCalls = function(script, fidMap) {
        let functions = pexService.getFunctions(script);
        functions.forEach(fn => {
            fn.instructions.forEach(n => {
                if (n.op !== CALLSTATIC.code) return;
                let methodName = resolveString(script, n.arguments[1]);
                if (methodName !== 'GetFormFromFile') return;
                let filename = resolveString(script, n.arguments[5]);
                log(`Found GetFormFromFile call targetting ${filename}`, true);
                if (!fidMap.hasOwnProperty(filename)) return;
                let oldFormId = xelib.Hex(n.arguments[4].data, 6),
                    newFormId = fidMap[filename][oldFormId];
                if (!newFormId) return log(`Form ID ${oldFormId} not renumbered`);
                log(`Changing Form ID from ${oldFormId} to ${newFormId}`);
                n.arguments[4].data = parseInt(newFormId, 16);
            });
        });
    };

    let fixStrings = function(script, merges) {
        let mergedPlugins = getMergedPlugins(merges);
        script.stringTable.forEach((str, index) => {
            let newStr = mergedPlugins[str];
            if (!newStr) return;
            log(`Changing string ${index} from ${str} to ${newStr}`);
            script.stringTable[index] = newStr;
        });
    };

    let relinkScripts = function(merges, scripts, fidMap, relinkerPath) {
        progress(`Relinking ${scripts.length} scripts`);
        scripts.forEach(entry => {
            let filePath = getScriptFilePath(entry);
            if (!filePath || !fh.jetpack.exists(filePath)) return;
            log(`Relinking ${filePath}`);
            let script = pexService.loadScript(filePath),
                newPath = `${relinkerPath}\\scripts\\${entry.filename}`;
            fixGetFormCalls(script, fidMap);
            fixStrings(script, merges);
            log(`Saving script to ${newPath}`);
            pexService.saveScript(script, newPath);
        });
    };

    this.run = function(merges) {
        let mergePath = settingsService.settings.mergePath,
            relinkerPath = `${mergePath}\\Relinker Output`;
        pexService.setLogger(progressLogger);
        progressLogger.run('relinker', relinkerPath, {
            title: 'Relinking Scripts',
            max: 3
        }, () => {
            let scripts = getScriptsToRelink(merges),
                fidMap = buildFormIdMap(merges);
            fh.jetpack.dir(`${relinkerPath}\\scripts`);
            relinkScripts(merges, scripts, fidMap, relinkerPath);
        });
    };
});

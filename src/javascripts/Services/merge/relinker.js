ngapp.service('relinker', function(scriptsCache, bsaHelpers, pexService, settingsService, progressLogger, gameService) {
    let {log, warn, progress} = progressLogger,
        opcodes = require('pex-parser/src/opcodes.js'),
        {dataPath} = gameService;

    const CALLMETHOD = opcodes.findByKey('name', 'callmethod');

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
            `${dataPath}${basePath}`;
    };

    let buildFormIdMap = function(merges) {
        progress('Building Form ID map');
        let mergePath = settingsService.settings.mergePath;
        return merges.reduce((fidMap, merge) => {
            log(`Loading FormID map for ${merge.name}`);
            let path = `${mergePath}\\${merge.name}\\merge\\map.json`,
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
                if (n.op !== CALLMETHOD.code) return;
                let methodName = resolveString(script, n.arguments[1]);
                if (methodName !== 'GetFormFromFile') return;
                let filename = resolveString(script, n.arguments[3]);
                log(`Found GetFormFromFile call targetting ${filename}`, true);
                if (!fidMap.hasOwnProperty(filename)) return;
                let oldFormId = xelib.Hex(n.arguments[2].data, 6),
                    newFormId = fidMap[filename][oldFormId];
                if (!newFormId) return log(`Form ID ${oldFormId} not renumbered`);
                log(`Changing Form ID from ${oldFormId} to ${newFormId}`);
                n.arguments[2].data = parseInt(newFormId, 16);
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

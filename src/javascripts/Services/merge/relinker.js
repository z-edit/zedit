ngapp.service('relinker', function(scriptsCache, bsaHelpers, pexService, settingsService, progressLogger) {
    let {log, warn, error, progress} = progressLogger,
        opcodes = require('pex-parser/src/opcodes.js'),
        dataPath;

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

    let getDataPath = function() {
        if (!dataPath) dataPath = xelib.GetGlobal('DataPath');
        return dataPath;
    };

    let getScriptFilePath = function(entry) {
        let basePath = `scripts\\${entry.filename}`;
        return entry.bsa ? bsaHelpers.extractFile(entry.bsa, basePath) :
            `${getDataPath()}\\${basePath}`;
    };

    let buildFormIdMap = function(merges) {
        progress('Building Form ID map');
        let {mergePath} = settingsService.settings;
        return merges.reduce((fidMap, merge) => {
            log(`Loading FormID map for ${merge.name}`);
            let path = `${mergePath}\\${merge.name}\\merge\\fidMap.json`,
                map = fh.loadJsonFile(path);
            if (!map) warn(`Form ID map for ${merge.name} not found.`);
            return Object.assign(fidMap, map || {});
        }, {});
    };

    let resolveString = function(script, arg) {
        return script.stringTable[arg.data];
    };

    let fixGetFormCalls = function(script, fidMap) {
        let functions = pexService.getFunctions(script);
        functions.forEach(fn => {
            fn.instructions.forEach(({op, arguments}) => {
                if (op !== CALLMETHOD.code) return;
                let methodName = resolveString(script, arguments[1]);
                if (methodName !== 'GetFormFromFile') return;
                let filename = resolveString(script, arguments[3]);
                log(`Found GetFormFromFile call targetting ${filename}`, true);
                if (!fidMap.hasOwnProperty(filename)) return;
                let oldFormId = xelib.Hex(arguments[2].data, 6),
                    newFormId = fidMap[filename][oldFormId];
                if (!newFormId) return log(`Form ID ${oldFormId} not renumbered`);
                log(`Changing Form ID from ${oldFormId} to ${newFormId}`);
                arguments[2].data = parseInt(newFormId, 16);
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

    let relinkScripts = function(scripts, fidMap, relinkerPath) {
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
        let {relinkerPath} = settingsService.settings;
        progressLogger.init('relinker', relinkerPath);
        try {
            let scripts = getScriptsToRelink(merges),
                fidMap = buildFormIdMap(merges);
            fh.jetpack.dir(`${relinkerPath}\\scripts`);
            relinkScripts(scripts, fidMap, relinkerPath);
        } catch(x) {
            error(`Error relinking scripts:\n${x.stack}`);
        } finally {
            progressLogger.close();
        }
    };
});

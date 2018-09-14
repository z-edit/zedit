ngapp.service('relinker', function(scriptsCache, bsaHelpers, pexService, settingsService) {
    let opcodes = require('pex-parser/src/opcodes.js'),
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
        return merges.reduce((fidMap, merge) => {
            // TODO
        }, {});
    };

    let resolveString = function(script, arg) {
        return script.stringTable[arg.data];
    };

    let fixGetFormCalls = function(script, merges) {
        let fidMap = buildFormIdMap(merges),
            functions = pexService.getFunctions(script);
        functions.forEach(fn => {
            fn.instructions.forEach(({op, arguments}) => {
                if (op !== CALLMETHOD.code) return;
                let methodName = resolveString(script, arguments[1]);
                if (methodName !== 'GetFormFromFile') return;
                let filename = resolveString(script, arguments[3]);
                if (!fidMap.hasOwnProperty(filename)) return;
                let oldFormId = xelib.Hex(arguments[2].data, 6),
                    newFormId = fidMap[filename][oldFormId];
                if (!newFormId) return;
                // TODO: log message
                arguments[2].data = parseInt(newFormId, 16);
            });
        });
    };

    let fixStrings = function(script, merges) {
        let mergedPlugins = getMergedPlugins(merges);
        script.stringTable.forEach((str, index) => {
            let newStr = mergedPlugins[str];
            if (newStr) script.stringTable[index] = newStr;
        });
    };

    this.relinkScripts = function(merges) {
        let scripts = getScriptsToRelink(merges),
            {relinkerPath} = settingsService.settings;
        fh.jetpack.dir(`${relinkerPath}\\scripts`);
        scripts.forEach(entry => {
            let filePath = getScriptFilePath(entry);
            if (!filePath || !fh.jetpack.exists(filePath)) return;
            let script = pexService.loadScript(filePath),
                newPath = `${relinkerPath}\\scripts\\${entry.filename}`;
            fixStrings(script, merges);
            fixGetFormCalls(script, merges);
            pexService.saveScript(script, newPath);
        });
    };
});

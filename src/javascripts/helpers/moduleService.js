export default function(ngapp, fh) {
    let modules = {},
        failures = [];

    let createModuleLoader = function(modulePath, info) {
        let code = fh.loadTextFile(`${modulePath}\\index.js`);
        return {
            info: info,
            fn: new Function('ngapp', 'fh', 'info', code)
        }
    };

    let validateModule = function(info) {
        return info && info.hasOwnProperty('id') && info.hasOwnProperty('name');
    };

    let getModuleInfo = function(modulePath) {
        let info = fh.loadJsonFile(`${modulePath}\\module.json`, null);
        return validateModule(info) && info;
    };

    let getModuleFolders = function() {
        return fh.jetpack.find('modules', {
            matching: '*',
            files: false,
            directories: true,
            recursive: false
        });
    };

    let missingRequirementError = function(info) {
        let message = `Module ${info.name} requires modules which could not be found: `;
        info.requires.forEach(function(requirement) {
            if (modules.hasOwnProperty(requirement)) return;
            message += `\r\n- ${requirement}`;
        });
        failures.push(message);
    };

    let missingInfoError = function(modulePath) {
        failures.push(`Missing module.json file at ${modulePath}, failed to load module.`);
    };

    let allRequirementsLoaded = function(requirements) {
        if (!requirements) return true;
        return requirements.reduce(function(b, requirement) {
            return b && modules.hasOwnProperty(requirement);
        }, true);
    };

    let load = function(loader) {
        loader.fn(ngapp, fh, loader.info);
        modules[loader.info.id] = loader.info;
    };

    let failedToLoadModules = function(loaders) {
        loaders.forEach((loader) => missingRequirementError(loader.info));
    };

    let executeLoaders = function(loaders) {
        let unloadedCount = loaders.length,
            lastUnloadedCount = 0,
            unloadedLoaders = loaders;
        while (unloadedCount > 0 && unloadedCount !== lastUnloadedCount) {
            unloadedLoaders = unloadedLoaders.filter(function(loader) {
                if (!allRequirementsLoaded(loader.info.requires)) return true;
                load(loader);
            });
            lastUnloadedCount = unloadedCount;
            unloadedCount = unloadedLoaders.length;
        }
        if (unloadedCount > 0) failedToLoadModules(unloadedLoaders);
    };

    return {
        loadModules: function() {
            let moduleFolders = getModuleFolders(),
                moduleLoaders = [];
            moduleFolders.forEach(function(modulePath) {
                let info = getModuleInfo(modulePath);
                if (!info) {
                    missingInfoError(modulePath);
                } else {
                    moduleLoaders.push(createModuleLoader(modulePath, info));
                }
            });
            executeLoaders(moduleLoaders);
        },
        loadModule: function(modulePath) {
            let info = getModuleInfo(modulePath);
            if (!info) {
                missingInfoError(modulePath);
            } else {
                let loader = createModuleLoader(modulePath, info);
                if (allRequirementsLoaded(info.requires)) {
                    load(loader);
                    return true;
                } else {
                    missingRequirementError(info);
                }
            }
        },
        /*
         * 1. Extract module to temporary folder
         * 2. Load module info, if invalid fail and inform user, else continue.
         * 3. Check if a module is already installed with the same name
         * 4. If it does, prompt the user to check if they want to update, else prompt the
         *    user to verify they want to install the module
         * 5. Move module folder from temporary location to modules folder
         * 6. Load module if it can be hotloaded
         */
        installModule: function(filePath) {
            // TODO
        }
    }
};

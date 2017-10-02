export default function(ngapp, fh) {
    let modules = {},
        failures = [],
        loaders = {
            default: function(module, fh, ngapp, moduleService) {
                let args = {
                    ngapp: ngapp,
                    fh: fh,
                    info: module.info,
                    modulePath: module.path,
                    moduleService: moduleService
                };
                let fn = new Function(...Object.keys(args), module.code);
                fn(...Object.values(args));
            }
        },
        deferredModules = [];

    // PRIVATE FUNCTIONS
    let prepareModule = function(modulePath, info) {
        return {
            info: info,
            path: fh.getFileUrl(modulePath),
            code: fh.loadTextFile(`${modulePath}\\index.js`) || ''
        }
    };

    let validateModule = function(info) {
        return info && info.hasOwnProperty('id') && info.hasOwnProperty('name');
    };

    let getModuleInfo = function(modulePath) {
        let info = fh.loadJsonFile(`${modulePath}\\module.json`);
        return validateModule(info) && info;
    };

    let getModuleFolders = function() {
        if (!fh.jetpack.exists('modules')) return [];
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

    let loaderNotFoundError = function(module) {
        failures.push(`Failed to load ${module.info.id}, module loader ` +
            `${module.info.moduleLoader} not found.`);
    };

    let deferredError = function(module) {
        failures.push(`Failed to load ${module.info.id}, loader ` +
            `${module.info.moduleLoader} was declared but not instantiated.`);
    };

    let allRequirementsLoaded = function(requirements) {
        if (!requirements) return true;
        return requirements.reduce(function(b, requirement) {
            return b && modules.hasOwnProperty(requirement);
        }, true);
    };

    let build = function(module, allowDefer = true) {
        let loaderId = module.info.moduleLoader || 'default',
            loader = loaders[loaderId];
        if (!loader) {
            loaderNotFoundError(module);
        } else if (loader === true) {
            allowDefer ? deferredModules.push(module) : deferredError(module);
        } else {
            loader(modules, module, fh, ngapp, service);
            modules[module.info.id] = module.info;
        }
    };

    let failedToLoadModules = function(modules) {
        modules.forEach((module) => missingRequirementError(module.info));
    };

    let buildModules = function(modules) {
        let unloadedCount = modules.length,
            lastUnloadedCount = 0,
            unloadedModules = modules;
        while (unloadedCount > 0 && unloadedCount !== lastUnloadedCount) {
            unloadedModules = unloadedModules.filter(function(module) {
                if (!allRequirementsLoaded(module.info.requires)) return true;
                build(module);
            });
            lastUnloadedCount = unloadedCount;
            unloadedCount = unloadedModules.length;
        }
        if (unloadedCount > 0) failedToLoadModules(unloadedModules);
    };

    // PUBLIC API
    let service = {
        getActiveModules: () => { return modules; },
        getInstalledModules: function() {
            let moduleFolders = getModuleFolders();
            return moduleFolders.map(function(modulePath) {
                let info = getModuleInfo(modulePath);
                if (info) info.modulePath = modulePath;
                return info;
            }).filter((info) => { return !!info });
        },
        loadModules: function() {
            let moduleFolders = getModuleFolders(),
                modules = [];
            moduleFolders.forEach(function(modulePath) {
                let info = getModuleInfo(modulePath);
                if (!info) {
                    missingInfoError(modulePath);
                } else {
                    modules.push(prepareModule(modulePath, info));
                }
            });
            buildModules(modules);
        },
        loadModule: function(modulePath) {
            let info = getModuleInfo(modulePath);
            if (!info) {
                missingInfoError(modulePath);
            } else {
                let module = prepareModule(modulePath, info);
                if (allRequirementsLoaded(info.requires)) {
                    build(module);
                    return true;
                } else {
                    missingRequirementError(info);
                }
            }
        },
        loadDeferredModules: function() {
            deferredModules.forEach((module) => build(module, false));
        },
        registerLoader: (id, loaderFunction) => loaders[id] = loaderFunction,
        deferLoader: (id) => loaders[id] = true
    };

    return service;
};

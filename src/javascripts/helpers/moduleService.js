export default function(ngapp, fh, logger) {
    let modules = {},
        loaders = {
            default: function({module, fh, logger, ngapp, moduleService}) {
                Function.execute({
                    ngapp, fh, logger, moduleService,
                    info: module.info,
                    moduleUrl: fh.pathToFileUrl(module.path),
                    modulePath: module.path
                }, module.code, module.info.id);
            }
        },
        deferredModules = [];

    // PRIVATE FUNCTIONS
    let prepareModule = function(modulePath, info) {
        return {
            info: info,
            path: modulePath,
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
        let message = `Module ${info.name} requires modules which could not be found:`;
        info.requires.forEach(function(requirement) {
            if (modules.hasOwnProperty(requirement)) return;
            message += `\n- ${requirement}`;
        });
        logger.error(message);
    };

    let missingInfoError = function(modulePath) {
        logger.error(`Missing module.json file at ${modulePath}, failed to` +
            `load module.`);
    };

    let loaderNotFoundError = function(module) {
        logger.error(`Failed to load ${module.info.id}, module loader ` +
            `${module.info.moduleLoader} not found.`);
    };

    let deferredError = function(module) {
        logger.error(`Failed to load ${module.info.id}, loader ` +
            `${module.info.moduleLoader} was declared but not instantiated.`);
    };

    let loadFailedError = function(module, error) {
        logger.error(`Failed to load ${module.info.id}, load error:\n\n` +
            error.stack);
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
            if (allowDefer) return deferredModules.push(module) > 0;
            deferredError(module);
        } else {
            try {
                logger.info(`Loading module ${module.info.id}`);
                loader({module, fh, ngapp, logger, moduleService: service});
                modules[module.info.id] = module.info;
                return true;
            } catch (x) {
                loadFailedError(module, x);
            }
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
            logger.info('Loading modules...');
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
            logger.info('Modules loaded');
        },
        loadModule: function(modulePath) {
            let info = getModuleInfo(modulePath);
            if (!info) {
                missingInfoError(modulePath);
            } else {
                let module = prepareModule(modulePath, info);
                return allRequirementsLoaded(info.requires) ?
                    build(module) : missingRequirementError(info);
            }
        },
        loadDeferredModules: function() {
            logger.info('Loading deferred modules...');
            deferredModules.forEach(m => build(m, false));
            logger.info('Deferred modules loaded');
        },
        registerLoader: (id, loaderFunction) => loaders[id] = loaderFunction,
        deferLoader: (id) => loaders[id] = true
    };

    return service;
};

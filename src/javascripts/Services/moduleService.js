ngapp.service('moduleService', function() {
    let service = this,
        modules = {};

    this.loadModule = function(modulePath, info) {
        modules[info.name] = info;
        let code = fh.loadTextFile(`${modulePath}\\index.js`);
        (new Function('ngapp', 'fh', 'info', code))(ngapp, fh, info);
    };

    this.validateModule = function(info) {
        return info && info.hasOwnProperty('id') && info.hasOwnProperty('name');
    };

    this.getModuleInfo = function(modulePath) {
        let info = fh.loadJsonFile(`${modulePath}\\module.json`, null);
        return service.validateModule(info) && info;
    };

    this.loadModules = function() {
        let moduleFolders = fh.jetpack.find('modules', {
            matching: '*',
            files: false,
            directories: true,
            recursive: false
        });
        moduleFolders.forEach(function(modulePath) {
            let info = service.getModuleInfo(modulePath);
            if (!info) return;
            service.loadModule(modulePath, info);
        });
    };

    this.installModule = function(filePath) {
        /* TODO
         * extract module to temporary folder
         * load module info, if invalid fail and inform user, else
         * check if a module already exists with the same name, if it does
         * prompt the user to check if they want to update else
         * prompt user to verify they want to install the module
         * move module folder from temporary location to modules folder
         * load module
         */
    };
});
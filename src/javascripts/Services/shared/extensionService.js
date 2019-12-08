ngapp.service('extensionService', function(themeService) {
    const tabs = [
        'Installed Modules', 'Installed Themes',
        'Browse Modules', 'Browse Themes'
    ];
    let installedThemes, installedModules;

    let copyThemeFile = function(themeFilePath) {
        let themeFileName = fh.extractFileName(themeFilePath);
        fs.jetpack.copy(themeFilePath, `themes/${themeFileName}`)
    };

    let extractThemeArchive = function(archivePath) {
        let filename = fh.getFileName(archivePath),
            tempPath = fh.userDir.path(filename);
        fh.extractArchive(archivePath, tempPath, true);
        let themeFile = fh.find(tempPath, { matching: '*.css' })[0];
        if (!themeFile) throw new Error(`No theme file found in ${archivePath}`);
        let destPath = fh.jetpack.path(`themes\\${fh.getFileName(themeFile)}`);
        fh.jetpack.copy(themeFile, destPath, { overwrite: true });
        fh.jetpack.remove(tempPath);
    };

    let loadModuleInfo = function(dir) {
        if (fh.fileExists(`${dir}\\dist\\module.json`))
            dir = `${dir}\\dist`;
        return [fh.loadJsonFile(`${dir}\\module.json`), dir];
    };

    let getModuleInfo = function(modulePath) {
        let dir = modulePath;
        if (fh.fileExists(`${dir}\\module.json`)) {
            return loadModuleInfo(dir);
        } else {
            dir = fh.getDirectories(modulePath).find(dir => {
                return fh.fileExists(`${dir}\\module.json`);
            });
            if (!dir) throw new Error('No module.json found.');
            return loadModuleInfo(dir);
        }
    };

    let installModule = function(sourcePath) {
        let [info, dir] = getModuleInfo(sourcePath),
            modulePath = `modules\\${info.id}`;
        if (fh.directoryExists(modulePath)) {
            // TODO: prompt here
            fh.jetpack.remove(modulePath);
        }
        fh.jetpack.copy(dir || sourcePath, modulePath);
    };

    let copyModule = function(moduleFilePath) {
        let modulePath = fh.getDirectory(moduleFilePath);
        installModule(modulePath);
    };

    let extractModuleArchive = function(archivePath) {
        let filename = fh.getFileName(archivePath),
            tempPath = fh.userDir.path(filename);
        fh.extractArchive(archivePath, tempPath, true);
        installModule(tempPath);
        fh.jetpack.remove(tempPath);
    };

    this.getTabs = function() {
        return tabs.map(tab => {
            let tabVarName = tab.toCamelCase();
            return {
                label: tab,
                templateUrl: `partials/manageExtensions/${tabVarName}.html`,
                controller: `${tabVarName}Controller`
            };
        });
    };

    this.getInstalledThemes = function(forceRefresh) {
        if (!installedThemes || forceRefresh) {
            installedThemes = themeService.getThemes();
        }
        return installedThemes;
    };

    this.getInstalledModules = function(forceRefresh) {
        if (!installedModules || forceRefresh) {
            installedModules = moduleService.getInstalledModules();
        }
        return installedModules;
    };

    this.installTheme = function(themeFilePath) {
        let isZip = fh.getFileExt(themeFilePath) === 'zip';
        (isZip ? extractThemeArchive : copyThemeFile)(themeFilePath);
    };

    this.installModule = function(moduleFilePath) {
        let isZip = fh.getFileExt(moduleFilePath) === 'zip';
        (isZip ? extractModuleArchive : copyModule)(moduleFilePath);
    };
});

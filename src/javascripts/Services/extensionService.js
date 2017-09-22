ngapp.service('extensionService', function(themeService) {
    const tabs = ['Installed Modules', 'Installed Themes'];
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
    };

    let getModuleInfo = function(tempPath) {
        let testPath = `${tempPath}\\module.json`;
        if (tempDir.exists(testPath)) {
            return [fh.loadJsonFile(testPath)];
        } else {
            let dir = fh.getDirectories(tempPath).find(function(dir) {
                return fh.jetpack.exists(`${dir}\\module.json`);
            });
            if (!dir) throw new Error('No module.json found.');
            return [fh.loadJsonFile(`${dir}\\module.json`), dir];
        }
    };

    let installModule = function(tempPath) {
        let [info, dir] = getModuleInfo(tempPath),
            modulePath = `modules\\${info.id}`;
        // TODO: prompt if module path exists
        fh.jetpack.dir(modulePath, { empty: true });
        fh.jetpack.copy(dir || tempPath, modulePath);
    };

    this.getTabs = function() {
        return tabs.map(function(tab) {
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
        let filename = fh.getFileName(moduleFilePath),
            tempPath = fh.userDir.path(filename);
        fh.extractArchive(moduleFilePath, tempPath, true);
        installModule(tempPath);
    };
});

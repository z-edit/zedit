ngapp.service('modOrganizerService', function(fileSearchService, mergeLogger) {
    let service = this;

    let backslash = path => path.replace(/\//g, '\\');

    let getInstancePath = function(moInstance) {
        return `${process.env.LOCALAPPDATA}/ModOrganizer/${moInstance}`;
    };

    let loadModOrganizerIni = function({moInstance, managerPath}) {
        let basePath = moInstance ? getInstancePath(moInstance) : managerPath;
        return fh.loadIni(`${basePath}\\ModOrganizer.ini`);
    };

    let getIniValue = function(ini, sectionName, key) {
        let section = ini.getSection(sectionName);
        return section && section.getValue(key);
    };

    let modNotInMerge = function(merge) {
        let modNames = [];
        merge.plugins.forEach(plugin => {
            let modName = fh.getFileName(plugin.dataFolder);
            if (modNames.indexOf(modName) > -1) return;
            let plugins = fh.getFiles(plugin.dataFolder, {
                matching: '*.esp', recursive: false
            });
            if (plugins.subtract(merge.plugins).length > 0) return;
            modNames.push('+' + modName.toLowerCase());
        });
        return line => modNames.indexOf(line.toLowerCase()) === -1;
    };

    this.getModManagerPath = function() {
        return fileSearchService.findFile(/^ModOrganizer\.exe$/, {
            initialQueue: [
                process.env.USERPROFILE,
                `${process.env.USERPROFILE}\\My Documents`,
                `${process.env.USERPROFILE}\\Desktop`
            ].map(path => ({ path, priority: 2 })),
            prioritize: [/organizer/i, /^mo$/i, /mod/i, /tool/i, /gam(e|ing)/i,
                /program/i, /steam/i, /^common$/, /(Skyrim|Fallout|Oblivion)/i]
        });
    };

    this.getInstanceModsPath = function(moInstance) {
        let moIni = loadModOrganizerIni({moInstance}),
            modsDirectory = getIniValue(moIni, 'Settings', 'mods_directory'),
            baseDirectory = getIniValue(moIni, 'Settings', 'base_directory');
        if (modsDirectory) return backslash(modsDirectory);
        if (baseDirectory) return `${backslash(baseDirectory)}\\mods`;
        return '';
    };

    this.getPortableModsPath = function(managerPath) {
        let modsPath = `${managerPath}\\mods`;
        if (fh.jetpack.exists(modsPath) === 'dir') return modsPath;
        return '';
    };

    this.getCurrentInstance = function() {
        let keyPath = 'SOFTWARE\\Tannin\\Mod Organizer',
            values = fh.getRegistryValues('HKEY_CURRENT_USER', keyPath),
            currentInstance = values.findByKey('name', 'CurrentInstance');
        if (currentInstance) return currentInstance.data;
    };

    this.getInstances = function() {
        let path = `${process.env.LOCALAPPDATA}/ModOrganizer`;
        return fh.getDirectories(path).map(path => fh.getFileName(path));
    };

    this.detect = function(settings) {
        let mo2 = settings.modManager === 'Mod Organizer 2';
        settings.moInstance = mo2 ? service.getCurrentInstance() : null;
        settings.managerPath = service.getModManagerPath();
        settings.modsPath = settings.moInstance ?
            service.getInstanceModsPath(settings.moInstance) :
            service.getPortableModsPath(settings.managerPath);
        return (settings.managerPath !== '') && (settings.modsPath !== '');
    };

    this.getProfilePath = function(settings) {
        let moIni = loadModOrganizerIni(settings),
            baseDirectory = getIniValue(moIni, 'Settings', 'base_directory'),
            selectedProfile = getIniValue(moIni, 'General', 'selected_profile'),
            profilesPath = `${baseDirectory || settings.managerPath}\\profiles`;
        return `${profilesPath}\\${selectedProfile}`;
    };

    this.getModList = function(settings) {
        let profilePath = service.getProfilePath(settings),
            modListPath = `${profilePath}\\modlist.txt`;
        return fh.loadTextFile(modListPath);
    };

    this.disableMods = function(merge, settings) {
        let notInMerge = modNotInMerge(merge),
            modlist = service.getModList(settings),
            newModList = modlist.split('\r\n').map(line => {
                if (notInMerge(line)) return line;
                mergeLogger.log(`Disabling mod: ${line.slice(1)}`);
                return line.replace(/^\+/, '-');
            }).join('\r\n');
        if (newModList === modList) return;
        fh.saveTextFile(modListPath, newModList);
    };
});

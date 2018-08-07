ngapp.service('modOrganizerService', function(fileSearchService) {
    let service = this;

    let getInstancePath = function(moInstance) {
        return `${process.env.LOCALAPPDATA}/ModOrganizer/${moInstance}`;
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
        let instancePath = getInstancePath(moInstance),
            moIni = fh.loadIni(`${instancePath}/ModOrganizer.ini`),
            section = moIni && moIni.getSection('Settings'),
            modsDirectory = section && section.getValue('mods_directory'),
            baseDirectory = section && section.getValue('base_directory');
        if (modsDirectory) return modsDirectory;
        if (baseDirectory) return `${baseDirectory}/mods`;
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
});

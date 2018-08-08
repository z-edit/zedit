ngapp.service('modManagerService', function(nexusModManagerService, vortexService, modOrganizerService) {
    let service = this;

    let modOrganizerShared = {
        detect: modOrganizerService.detect,
        moHidden: modOrganizerService.hidePluginFiles,
        disableMods: modOrganizerService.disableMods
    };

    this.modManagers = [
        Object.assign({
            name: 'Mod Organizer 2',
            show: ['managerPath', 'modsPath', 'moInstance']
        }, modOrganizerShared),
        Object.assign({
            name: 'Mod Organizer',
            show: ['managerPath', 'modsPath']
        }, modOrganizerShared),
        {
            name: 'Vortex',
            show: ['managerPath', 'modsPath'],
            detect: vortexService.detect
        },
        {
            name: 'Nexus Mod Manager',
            show: ['managerPath', 'modsPath'],
            detect: nexusModManagerService.detect
        }
    ];

    this.addModManager = function(manager) {
        service.modManagers.push(manager);
    };

    this.getModManager = function(name) {
        return service.modManagers.find(m =>  m.name === name);
    };
});

ngapp.service('modManagerService', function(nexusModManagerService, vortexService, modOrganizerService) {
    let service = this;

    this.modManagers = [{
        name: 'Mod Organizer 2',
        show: ['managerPath', 'modsPath', 'moInstance'],
        detect: modOrganizerService.detect
    }, {
        name: 'Mod Organizer',
        show: ['managerPath', 'modsPath'],
        detect: modOrganizerService.detect
    }, {
        name: 'Vortex',
        show: ['managerPath', 'modsPath'],
        detect: vortexService.detect
    }, {
        name: 'Nexus Mod Manager',
        show: ['managerPath', 'modsPath'],
        detect: nexusModManagerService.detect
    }];

    this.addModManager = function(manager) {
        service.modManagers.push(manager);
    };

    this.getModManager = function(name) {
        return service.modManagers.find(m =>  m.name === name);
    };
});

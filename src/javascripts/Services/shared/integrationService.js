ngapp.service('integrationService', function() {
    let service = this;

    this.defaultSettings = {};
    this.integrations = [];

    this.addIntegration = function(integration) {
        service.integrations.push(integration);
        service.integrations.sortOnKey('priority');
        Object.assign(service.defaultSettings, integration.defaultSettings);
    };
});
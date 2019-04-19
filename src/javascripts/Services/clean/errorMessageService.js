ngapp.service('errorMessageService', function(pluginErrorHelpers) {
    let service = this;

    let messageFormats = {
        ITM: function(error) {
            return [error.name];
        },
        ITPO: function(error) {
            return [error.name];
        },
        DR: function(error) {
            if (pluginErrorHelpers.isNavmeshError(error))
                return [error.name, `Navmesh marked as deleted.`];
            if (pluginErrorHelpers.isUDR(error))
                return [error.name, `Reference marked as deleted.`];
            return [error.name, `Record marked as deleted but contains: ${error.data}`];
        },
        UES: function(error) {
            return [error.name, `Error: Record contains unexpected (or out of order) subrecord ${error.data}`];
        },
        URR: function(error) {
            return [error.name, `${error.path}: [${error.data}] < Error: Could not be resolved >`];
        },
        UER: function(error) {
            let dataParts = error.data.split(/,(.+)?/, 2);
            return [error.name, `${error.path}: Found a (${dataParts[0]}) reference, expected: ${dataParts[1]}`];
        },
        OE: function(error) {
            return [error.name, `${error.data}`];
        }
    };

    // PUBLIC API
    this.getErrorMessage = function(error) {
        let acronym = pluginErrorHelpers.errorAcronyms[error.group];
        return messageFormats[acronym](error);
    };

    this.getErrorMessages = function(errors) {
        errors.forEach(error => {
            error.message = service.getErrorMessage(error);
        });
    };
});

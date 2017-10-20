ngapp.service('errorResolutionFactory', function(pluginErrorService, pluginErrorHelpers, xelibService, navmeshHelpers) {
    // PRIVATE
    let withErrorElement = pluginErrorHelpers.withErrorElement;

    let removeRecordResolution = {
        label: 'Delete',
        class: 'negative',
        description: 'This resolution will remove the record from the plugin.',
        execute: function(error) {
            xelib.RemoveElement(error.handle);
        }
    };

    let tweakEdidResolution = {
        label: 'Tweak EDID',
        class: 'positive',
        description: 'This resolution will adjusted the EditorID of the record so it is no longer an ITM.',
        available: function(error) {
            return xelib.HasElement(error.handle, 'EDID');
        },
        execute: function(error, tweak) {
            if (!tweak) tweak = '-Intended';
            let oldEdid = xelib.GetValue(error.handle, 'EDID');
            xelib.SetValue(error.handle, 'EDID', oldEdid + tweak);
        }
    };

    let tweakPositionResolution = {
        label: 'Tweak Position',
        class: 'positive',
        description: 'This resolution will slightly adjust the position of the reference so it is no longer an ITM.',
        available: function(error) {
            return xelib.HasElement(error.handle, 'DATA\\Position');
        },
        execute: function(error, tweak) {
            xelib.Translate(error.handle, tweak || {
                X: -0.000005,
                Y:  0.000002,
                Z: -0.000001
            });
        }
    };

    let nullifyResolution = {
        label: 'Nullify',
        class: 'positive',
        description: 'This resolution will set the reference to a NULL [00000000] reference.',
        available: function(error) {
            if (error.group === 5) {
                // if error is UER, get expected signatures from error data
                let expectedSignatures = error.data.split(/,(.+)?/, 2)[1];
                return expectedSignatures.indexOf('NULL') > -1;
            } else {
                return withErrorElement(error, function(element) {
                    return xelib.GetSignatureAllowed(element, 'NULL');
                });
            }
        },
        execute: function(error) {
            withErrorElement(error, function(element) {
                xelib.SetUIntValue(element, 0);
            });
        }
    };

    let removeResolution = {
        label: 'Remove',
        class: 'negative',
        description: 'This resolution will remove the error element from the record.',
        execute: function(error) {
            withErrorElement(error, function(element) {
                xelib.RemoveElementOrParent(element);
            });
        }
    };

    let repairResolution = {
        label: 'Repair',
        class: 'positive',
        description: 'This resolution will fix the order of subrecords in the record and trim invalid ones.',
        execute: function(error) {
            xelib.WithHandle(xelib.GetElementFile(error.handle), function(file) {
                let copy = xelib.CopyElement(error.handle, file, true);
                let formID = xelib.GetFormID(error.handle);
                xelib.RemoveElement(error.handle);
                xelib.SetFormID(copy, formID);
                xelib.Switch(error.handle, copy);
            });
        }
    };

    let ignoreResolution = {
        label: 'Ignore',
        class: 'neutral',
        description: 'This resolution will leave the error in the plugin.'
    };

    let replaceNavmeshResolution = {
        label: 'Replace Navmesh',
        class: 'positive',
        description: 'This resolution will replace the deleted navmesh with the new navmesh introduced by the plugin.',
        available: function(error) {
            return pluginErrorService.isNavmeshError(error) &&
                navmeshHelpers.hasReplacementNavmesh(error.handle);
        },
        execute: function(error) {
            navmeshHelpers.withReplacementNavmesh(error.handle, function(navmesh) {
                let plugin = xelib.GetElementFile(navmesh),
                    oldFormID = xelib.GetFormID(navmesh),
                    newFormID = xelib.GetFormID(error.handle);
                console.log(`Removing [NAVM:${oldFormID}] and replacing it with [NAVM:${newFormID}]`);
                xelib.RemoveElement(error.handle);
                xelib.SetFormID(navmesh, newFormID, false, false);
                let records = xelib.GetRecords(plugin, 'NAVM,NAVI', true);
                xelibService.WithHandles(records, function(records) {
                    records.forEach(function(record) {
                        xelib.ExchangeReferences(record, oldFormID, newFormID);
                    });
                });
            });
        }
    };

    let buryNavmeshResolution = {
        label: 'Bury Navmesh',
        class: 'positive',
        description: 'This resolution will lower the navmesh\'s verticies below the ground and remove its edge links.',
        available: isNavmeshError,
        execute: function(error) {
            console.log(`Burying [NAVM:${xelib.GetFormID(error.handle)}]`);
            xelib.SetRecordFlag(error.handle, 'Deleted', false);
            navmeshHelpers.bury(error.handle);
        }
    };

    let undeleteAndDisableResolution = {
        label: 'Undelete and Disable',
        class: 'positive',
        description: 'This resolution will undelete the reference and mark it as disabled.',
        available: pluginErrorHelpers.isUDR,
        execute: function(error) {
            xelib.SetRecordFlag(error.handle, 'Deleted', false);
            xelib.SetRecordFlag(error.handle, 'Initially Disabled', true);
        }
    };

    let clearSubrecordsResolution = {
        label: 'Clear Subrecords',
        color: 'positive',
        description: 'This resolution will clear the record\'s subrecords.',
        available: function(error) {
            return !pluginErrorHelpers.isUDR(error) &&
                !pluginErrorHelpers.isNavmeshError(error);
        },
        execute: function(error) {
            xelib.SetRecordFlag(error.handle, 'Deleted', false);
            xelib.SetRecordFlag(error.handle, 'Deleted', true);
        }
    };

    let restoreResolution = {
        label: 'Restore',
        class: 'negative',
        description: 'This resolution will restore the record.  You should not use this resolution unless you know exactly what you\'re doing!',
        execute: function(error) {
            xelib.SetRecordFlag(error.handle, 'Deleted', false);
        }
    };

    let identicalResolutions = [removeRecordResolution, tweakEdidResolution, tweakPositionResolution, ignoreResolution];

    // PUBLIC
    this.errorResolutions = {
        ITM: identicalResolutions,
        ITPO: identicalResolutions,
        DR: [replaceNavmeshResolution, buryNavmeshResolution, undeleteAndDisableResolution, clearSubrecordsResolution, restoreResolution, ignoreResolution],
        UES: [repairResolution, removeRecordResolution, ignoreResolution],
        URR: [nullifyResolution, removeResolution, ignoreResolution],
        UER: [nullifyResolution, removeResolution, ignoreResolution],
        OE: [ignoreResolution]
    };

    this.ignoreResolution = ignoreResolution;
});

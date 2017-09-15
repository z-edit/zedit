import { lib } from './lib';
import { Fail, GetArray, GetStringArray, wcb } from './helpers';

// MASTER HANDLING METHODS
Object.assign(xelib, {
    CleanMasters: function(_id) {
        if (!lib.CleanMasters(_id))
            Fail(`Failed to clean masters in: ${_id}`);
    },
    SortMasters: function(_id) {
        if (!lib.SortMasters(_id))
            Fail(`Failed to sort masters in: ${_id}`);
    },
    AddMaster: function(_id, filename) {
        if (!lib.AddMaster(_id, wcb(filename)))
            Fail(`Failed to add master "${filename}" to file: ${_id}`);
    },
    AddRequiredMasters: function(_id, _id2, asNew = false) {
        if (!lib.AddRequiredMasters(_id, _id2, asNew))
            Fail(`Failed to add required masters for ${_id} to file: ${_id2}`);
    },
    GetMasters: function(_id) {
        return GetArray(function(_len) {
            if (!lib.GetMasters(_id, _len))
                Fail(`Failed to get masters for ${_id}`);
        });
    },
    GetMasterNames: function(_id) {
        return GetStringArray(function(_len) {
            if (!lib.GetMasterNames(_id, _len))
                Fail(`Failed to get master names for ${_id}`);
        });
    },
    AddAllMasters: function(_id) {
        let filename = xelib.Name(_id),
            loadedFiles = xelib.GetLoadedFileNames(),
            fileIndex = loadedFiles.indexOf(filename);
        for (let i = 0; i < fileIndex; i++) {
            let filename = loadedFiles[i];
            if (filename.endsWith('.Hardcoded.dat')) continue;
            xelib.AddMaster(_id, filename);
        }
    },
    GetAvailableMasters: function(_id) {
        let fileName = xelib.Name(_id),
            allMasters = xelib.GetLoadedFileNames(),
            currentMasters = xelib.GetMasterNames(_id),
            fileIndex = allMasters.indexOf(fileName);
        return allMasters.slice(0, fileIndex).subtract(currentMasters);
    }
});

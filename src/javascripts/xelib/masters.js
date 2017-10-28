import { lib } from './lib';
import { Fail, GetArray, GetStringArray, wcb } from './helpers';

// MASTER HANDLING METHODS
Object.assign(xelib, {
    CleanMasters: function(id) {
        if (!lib.CleanMasters(id))
            Fail(`Failed to clean masters in: ${id}`);
    },
    SortMasters: function(id) {
        if (!lib.SortMasters(id))
            Fail(`Failed to sort masters in: ${id}`);
    },
    AddMaster: function(id, filename) {
        if (!lib.AddMaster(id, wcb(filename)))
            Fail(`Failed to add master "${filename}" to file: ${id}`);
    },
    AddRequiredMasters: function(id, id2, asNew = false) {
        if (!lib.AddRequiredMasters(id, id2, asNew))
            Fail(`Failed to add required masters for ${id} to file: ${id2}`);
    },
    GetMasters: function(id) {
        return GetArray(function(_len) {
            if (!lib.GetMasters(id, _len))
                Fail(`Failed to get masters for ${id}`);
        });
    },
    GetRequiredBy: function(id) {
        return GetArray(function(_len) {
            if (!lib.GetRequiredBy(id, _len))
                Fail(`Failed to get required by for ${id}`);
        });
    },
    GetMasterNames: function(id) {
        return GetStringArray(function(_len) {
            if (!lib.GetMasterNames(id, _len))
                Fail(`Failed to get master names for ${id}`);
        });
    },
    AddAllMasters: function(id) {
        let filename = xelib.Name(id),
            loadedFiles = xelib.GetLoadedFileNames(),
            fileIndex = loadedFiles.indexOf(filename);
        for (let i = 0; i < fileIndex; i++) {
            let filename = loadedFiles[i];
            if (filename.endsWith('.Hardcoded.dat')) continue;
            xelib.AddMaster(id, filename);
        }
    },
    GetAvailableMasters: function(id) {
        let fileName = xelib.Name(id),
            allMasters = xelib.GetLoadedFileNames(),
            currentMasters = xelib.GetMasterNames(id),
            fileIndex = allMasters.indexOf(fileName);
        return allMasters.slice(0, fileIndex).subtract(currentMasters);
    }
});

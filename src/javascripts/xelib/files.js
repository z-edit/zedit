import { lib } from './lib';
import { Fail, GetHandle, GetString, GetInteger, wcb } from './helpers';

// FILE HANDLING METHODS
Object.assign(xelib, {
    AddFile: function(filename) {
        return GetHandle(function(_res) {
            if (!lib.AddFile(wcb(filename), _res))
                Fail(`Failed to add new file: ${filename}`);
        });
    },
    FileByIndex: function(index) {
        return GetHandle((_res) => lib.FileByIndex(index, _res));
    },
    FileByLoadOrder: function(loadOrder) {
        return GetHandle((_res) => lib.FileByLoadOrder(loadOrder, _res));
    },
    FileByName: function(filename) {
        return GetHandle((_res) => lib.FileByName(wcb(filename), _res));
    },
    FileByAuthor: function(author) {
        return GetHandle((_res) => lib.FileByAuthor(wcb(author), _res));
    },
    NukeFile: function(id) {
        if (!lib.NukeFile(id))
            Fail(`Failed to nuke file: ${id}`);
    },
    RenameFile: function(id, newFileName) {
        if (!lib.RenameFile(id, wcb(newFileName)))
            Fail(`Failed to rename file to ${newFileName}`);
    },
    SaveFile: function(id, filePath = '') {
        if (!lib.SaveFile(id, wcb(filePath)))
            Fail(`Failed to save file: ${id}`);
    },
    GetOverrideRecordCount: function(id) {
        return GetInteger(function(_res) {
            if (!lib.GetOverrideRecordCount(id, _res))
                Fail(`Failed to get override record count for: ${id}`);
        });
    },
    GetRecordCount: function(id) {
        return GetInteger(function(_res) {
            if (!lib.GetRecordCount(id, _res))
                Fail(`Failed to get record count for: ${id}`);
        });
    },
    MD5Hash: function(id) {
        return GetString(function(_len) {
            if (!lib.MD5Hash(id, _len))
                Fail(`Failed to get MD5 Hash for: ${id}`);
        });
    },
    CRCHash: function(id) {
        return GetString(function(_len) {
            if (!lib.CRCHash(id, _len))
                Fail(`Failed to get CRC Hash for: ${id}`);
        });
    },
    GetFileLoadOrder: function(id) {
        return GetInteger(function(_res) {
            if (!lib.GetFileLoadOrder(id, _res))
                Fail(`Failed to file load order for: ${id}`);
        });
    },
    GetFileHeader: function(id) {
        return xelib.GetElement(id, 'File Header');
    }
});

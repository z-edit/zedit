import { lib, xelib } from './lib';
import { Fail, GetHandle, GetString, wcb } from './helpers';

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
    NukeFile: function(_id) {
        if (!lib.NukeFile(_id))
            Fail(`Failed to nuke file: ${_id}`);
    },
    RenameFile: function(_id, newFileName) {
        if (!lib.RenameFile(_id, wcb(newFileName)))
            Fail(`Failed to rename file to ${newFileName}`);
    },
    SaveFile: function(_id, filePath = '') {
        if (!lib.SaveFile(_id, wcb(filePath)))
            Fail(`Failed to save file: ${_id}`);
    },
    MD5Hash: function(_id) {
        return GetString(function(_len) {
            if (!lib.MD5Hash(_id, _len))
                Fail(`Failed to get MD5 Hash for: ${_id}`);
        });
    },
    CRCHash: function(_id) {
        return GetString(function(_len) {
            if (!lib.CRCHash(_id, _len))
                Fail(`Failed to get CRC Hash for: ${_id}`);
        });
    }
});

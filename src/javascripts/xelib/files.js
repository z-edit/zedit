// FILE HANDLING METHODS
xelib.AddFile = function(filename) {
    return GetHandle(function(_res) {
        if (!lib.AddFile(wcb(filename), _res))
            Fail(`Failed to add new file: ${filename}`);
    });
};
xelib.FileByIndex = function(index) {
    return GetHandle(function(_res) {
        if (!lib.FileByIndex(index, _res))
            Fail(`Failed to find file at index: ${index}`);
    });
};
xelib.FileByLoadOrder = function(loadOrder) {
    return GetHandle(function(_res) {
        if (!lib.FileByLoadOrder(loadOrder, _res))
            Fail(`Failed to find file at load order: ${loadOrder}`);
    });
};
xelib.FileByName = function(filename) {
    return GetHandle(function(_res) {
        if (!lib.FileByName(wcb(filename), _res))
            Fail(`Failed to find file: ${filename}`);
    });
};
xelib.FileByAuthor = function(author) {
    return GetHandle(function(_res) {
        if (!lib.FileByAuthor(wcb(author), _res))
            Fail(`Failed to find file with author: ${author}`);
    });
};
xelib.RenameFile = function(_id, newFileName) {
    if (!lib.RenameFile(_id, wcb(newFileName)))
        Fail(`Failed to rename file to ${newFileName}`);
};
xelib.SaveFile = function(_id, filePath = '') {
    if (!lib.SaveFile(_id, wcb(filePath)))
        Fail(`Failed to save file: ${_id}`);
};
xelib.MD5Hash = function(_id) {
    return GetString(function(_len) {
        if (!lib.MD5Hash(_id, _len))
            Fail(`Failed to get MD5 Hash for: ${_id}`);
    });
};
xelib.CRCHash = function(_id) {
    return GetString(function(_len) {
        if (!lib.CRCHash(_id, _len))
            Fail(`Failed to get CRC Hash for: ${_id}`);
    });
};
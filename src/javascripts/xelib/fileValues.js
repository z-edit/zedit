import {xelib} from './lib';

// FILE VALUE METHODS
xelib.GetFileHeader = function(_id) {
    return xelib.GetElement(_id, 'File Header');
};
xelib.GetNextObjectID = function(_id) {
    return xelib.GetUIntValue(_id, 'File Header\\HEDR\\Next Object ID');
};
xelib.SetNextObjectID = function(_id, nextObjectID) {
    this.SetUIntValue(_id, 'File Header\\HEDR\\Next Object ID', nextObjectID);
};
xelib.GetFileName = function(_id) {
    return xelib.Name(_id);
};
xelib.GetAuthor = function(_id) {
    return xelib.GetValue(_id, 'File Header\\CNAM', true);
};
xelib.SetAuthor = function(_id, author) {
    return xelib.SetValue(_id, 'File Header\\CNAM', author);
};
xelib.GetDescription = function(_id) {
    return xelib.GetValue(_id, 'File Header\\SNAM', true);
};
xelib.SetDescription = function(_id, description) {
    if (!xelib.HasElement(_id, 'File Header\\SNAM'))
        xelib.AddElement(_id, 'File Header\\SNAM');
    return xelib.SetValue(_id, 'File Header\\SNAM', description);
};
xelib.GetIsESM = function(_id) {
    return xelib.GetFlag(_id, 'File Header\\Record Header\\Record Flags', 'ESM');
};
xelib.SetIsESM = function(_id, enabled) {
    return xelib.SetFlag(_id, 'File Header\\Record Header\\Record Flags', 'ESM', enabled);
};
xelib.GetLoadedFileNames = function() {
    let fileNames = undefined;
    xelib.WithHandles(xelib.GetElements(), function(files) {
        fileNames = files.map((file) => { return xelib.Name(file) });
    });
    return fileNames;
};
// TODO: we probably should make a native function for this
xelib.GetFileLoadOrder = function(file) {
    return parseInt(xelib.DisplayName(file).substr(1, 2));
};

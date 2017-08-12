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
    return xelib.GetValue(_id, 'File Header\\CNAM');
};
xelib.SetAuthor = function(_id, author) {
    return xelib.SetValue(_id, 'File Header\\CNAM', wcb(author));
};
xelib.GetDescription = function(_id) {
    return xelib.GetValue(_id, 'File Header\\SNAM');
};
xelib.SetDescription = function(_id, description) {
    return xelib.SetValue(_id, 'File Header\\SNAM', wcb(description));
};
xelib.GetIsESM = function(_id) {
    return xelib.GetFlag(_id, 'File Header\\Record Header\\Record Flags', 'ESM');
};
xelib.SetIsESM = function(_id, enabled) {
    return xelib.SetFlag(_id, 'File Header\\Record Header\\Record Flags', 'ESM', enabled);
};
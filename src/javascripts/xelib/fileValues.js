// HELPER VARIABLES
let fileHeaderFlagsPath = 'File Header\\Record Header\\Record Flags',
    nextObjectIdPath = 'File Header\\HEDR\\Next Object ID';

// FILE VALUE METHODS
Object.assign(xelib, {
    GetNextObjectID: function(id) {
        return xelib.GetUIntValue(id, nextObjectIdPath);
    },
    SetNextObjectID: function(id, nextObjectID) {
        this.SetUIntValue(id, nextObjectIdPath, nextObjectID);
    },
    GetFileName: function(id) {
        return xelib.Name(id);
    },
    GetFileAuthor: function(id) {
        return xelib.GetValue(id, 'File Header\\CNAM');
    },
    SetFileAuthor: function(id, author) {
        return xelib.SetValue(id, 'File Header\\CNAM', author);
    },
    GetFileDescription: function(id) {
        return xelib.GetValue(id, 'File Header\\SNAM');
    },
    SetFileDescription: function(id, description) {
        if (!xelib.HasElement(id, 'File Header\\SNAM'))
            xelib.AddElement(id, 'File Header\\SNAM');
        return xelib.SetValue(id, 'File Header\\SNAM', description);
    },
    GetIsESM: function(id) {
        return xelib.GetFlag(id, fileHeaderFlagsPath, 'ESM');
    },
    SetIsESM: function(id, enabled) {
        return xelib.SetFlag(id, fileHeaderFlagsPath, 'ESM', enabled);
    }
});

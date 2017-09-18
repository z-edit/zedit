// GROUP HANDLING METHODS
Object.assign(xelib, {
    HasGroup: function(id, signature) {
        return xelib.HasElement(id, signature);
    },
    AddGroup: function(id, signature) {
        return xelib.AddElement(id, signature);
    },
    GetChildGroup: function(id) {
        return xelib.GetElement(id, 'Child Group');
    }
});

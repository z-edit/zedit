// GROUP HANDLING METHODS
Object.assign(xelib, {
    HasGroup: function(_id, signature) {
        return xelib.HasElement(_id, signature);
    },
    AddGroup: function(_id, signature) {
        return xelib.AddElement(_id, signature);
    },
    GetChildGroup: function(_id) {
        return xelib.GetElement(_id, 'Child Group');
    }
});

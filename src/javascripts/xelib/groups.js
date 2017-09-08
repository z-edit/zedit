import {xelib} from './lib';

// GROUP HANDLING METHODS
xelib.HasGroup = function(_id, signature) {
    return xelib.HasElement(_id, signature);
};
xelib.AddGroup = function(_id, signature) {
    return xelib.AddElement(_id, signature);
};
xelib.GetChildGroup = function(_id) {
    return xelib.GetElement(_id, 'Child Group');
};

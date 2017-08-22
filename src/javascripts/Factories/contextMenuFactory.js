ngapp.service('contextMenuFactory', function() {
    this.mainTreeItems = [{
        available: (items, node) => { return xelib.GetIsEditable(node.handle); },
        build: (items, node, scope) => {
            let addList = xelib.GetAddList(node.handle);
            items.push({
                label: 'Add',
                disabled: !addList.length,
                children: addList.map(function(item) {
                    return {
                        label: item,
                        callback: () => scope.addElement(node, item)
                    };
                })
            });
        }
    }, {
        available: (items, node) => { return xelib.GetIsRemoveable(node.handle); },
        build: (items, node, scope) => {
            items.push({
                label: 'Remove',
                callback: () => scope.removeElement(node)
            });
        }
    }];
});
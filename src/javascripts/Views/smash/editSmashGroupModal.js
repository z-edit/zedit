ngapp.controller('editSmashGroupModalController', function($scope) {
    // HELPER FUNCTIONS
    let getNewGroupName = function(groups) {
        let baseName = 'New Group',
            name = 'New Group',
            groupNames = groups.mapOnKey('name'),
            i = 2;
        while (groupNames.includes(name))
            name = `${baseName} ${i++}`;
        return name;
    };

    let getGroupContext = function(node) {
        let pathParts = node.path.split('\\');
        return pathParts.slice(0, -1).join('\\');
    };

    let getElements = function(group) {
        let {nodes, siblingNodes} = $scope.modalOptions;
        $scope.elements = siblingNodes.map(node => ({
            name: node.name,
            active: nodes.some(n => n.name === node.name) ||
                group && group.elements.includes(node.name)
        }));
    };

    let createNewGroup = function() {
        let {groups, nodes} = $scope.modalOptions;
        $scope.newGroup = true;
        $scope.group = {
            name: getNewGroupName(groups),
            description: 'A new group.',
            context: getGroupContext(nodes[0])
        };
        getElements();
    };

    let editGroup = function(node) {
        let {groups} = $scope.modalOptions;
        $scope.group = {
            name: node.group.name,
            description: node.group.description,
            context: node.group.context
        };
        $scope.groupIndex = groups.indexOf(node.group);
        $scope.originalName = node.group.name;
        $scope.editing = true;
        getElements(node.group);
    };

    let init = function() {
        let {nodes} = $scope.modalOptions;
        let nodeToEdit = nodes.find(node => node.group);
        nodeToEdit ? editGroup(nodeToEdit) : createNewGroup();
    };

    let unsetGroup = function(node) {
        if (node.name !== $scope.originalName) return;
        delete node.data.group;
    };

    // SCOPE FUNCTIONS
    $scope.createGroup = function() {
        let {groups, siblingNodes, nodesUpdated} = $scope.modalOptions;
        let index = $scope.groupIndex || groups.length;
        $scope.group.elements = [];
        siblingNodes.forEach(node => {
            let e = $scope.elements.findByKey('name', node.name);
            unsetGroup(node);
            if (!e.active) return;
            node.data.group = $scope.group.name;
            $scope.group.elements.push(e.name);
        });
        groups[index] = $scope.group;
        nodesUpdated(siblingNodes);
        $scope.$emit('closeModal');
    };

    // initialization
    init();
});

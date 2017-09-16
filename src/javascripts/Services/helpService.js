ngapp.service('helpService', function() {
    let service = this,
        topics = [];

    let topicExistsError = function(label) {
        return new Error(`Topic ${label} already exists.`);
    };

    let failedToResolveTopicError = function(path) {
        return new Error(`Failed to resolve help topic at path ${path}.`);
    };

    let getTopicChildren = function(path) {
        return service.getTopic(path).children;
    };

    this.getTopics = () => { return topics };

    this.addTopic = function(topic, path) {
        let target = path ? getTopicChildren(path) : topics,
            existingTopic = target.findByKey('label', topic.label);
        if (existingTopic) throw topicExistsError(topic.label);
        target.push(topic);
    };

    this.getTopic = function(path) {
        let pathParts = path.split('/'),
            result = topics.findByKey('label', pathParts[0]);
        for (let i = 1; i < pathParts.length; i++) {
            if (!result) return;
            result = result.children.findByKey('label', pathParts[i]);
        }
        if (!result) throw failedToResolveTopicError(path);
        return result;
    };
});

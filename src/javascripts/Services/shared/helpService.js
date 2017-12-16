ngapp.service('helpService', function() {
    let service = this,
        topics = [];

    // PRIVATE FUNCTIONS
    let topicExistsError = function(label) {
        return new Error(`Topic ${label} already exists.`);
    };

    let failedToResolveTopicError = function(path) {
        return new Error(`Failed to resolve help topic at path ${path}.`);
    };

    let getTopicChildren = function(path) {
        let topic = service.getTopic(path);
        if (!topic.children) topic.children = [];
        return topic.children;
    };

    let getTopicId = function(topic) {
        return topic.id || topic.label.split(' ').filter(function(part) {
            return !part.match(/\[.+\]/);
        }).map(function(str) {
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }).join('').uncapitalize();
    };

    let processTopics = function(topics, path) {
        return topics.map(function(topic) {
            let id = getTopicId(topic);
            topic.templateUrl = `${path}/${id}.html`;
            if (!topic.children) return topic;
            topic.children = processTopics(topic.children, `${path}/${id}`);
            return topic;
        });
    };

    let loadCoreTopics = function() {
        topics = processTopics(fh.loadResource('app/topics.json'), 'docs');
    };

    // API FUNCTIONS
    this.getTopics = () => { return topics };

    this.addTopic = function(topic, path) {
        let target = path ? getTopicChildren(path) : topics,
            existingTopic = target.findByKey('label', topic.label);
        if (existingTopic) throw topicExistsError(topic.label);
        target.push(topic);
    };

    this.getTopic = function(path, callback) {
        let pathParts = path.split('/'),
            result = topics.findByKey('label', pathParts[0]);
        for (let i = 1; i < pathParts.length; i++) {
            if (!result) break;
            if (callback) callback(result);
            result = result.children.findByKey('label', pathParts[i]);
        }
        if (!result) throw failedToResolveTopicError(path);
        return result;
    };

    // initialization
    loadCoreTopics()
});

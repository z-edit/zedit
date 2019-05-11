ngapp.service('changeMergeService', function($rootScope, pluginDiffCacheService, smashRuleService) {
    let signatureExpr = /[A-Z0-9:;<=>?@]{4}/,
        indexExpr = /\[\d+]/;

    // private
    let getElementResolver = function(str) {
        if (str.match(signatureExpr)) return e => e.startsWith(str);
        if (str.match(indexExpr)) return () => true;
        return e => e === str;
    };

    let getEntityPath = function(pathParts, index) {
        return pathParts.slice(0, index + 1).join('\\');
    };

    let resolveRule = function(rules, change) {
        let pathParts = change.path.split('\\'),
            sortPathParts = change.sortPath.split('\\'),
            highestPriority = rules.priority || 0,
            rule = rules,
            parentRule = null,
            entityPath = null;
        if (pathParts.length === 0)
            throw new Error(`Invalid path ${path}`);
        pathParts.forEach((part, index) => {
            parentRule = rule;
            rule = rule.elements.find(getElementResolver(part));
            if (!rule) throw new Error(`Could not resolve rule for ${part}`);
            if (rule.entity) entityPath = getEntityPath(sortPathParts, index);
            if (rule.priority && rule.priority > highestPriority)
                highestPriority = rule.priority;
        });
        return Object.assign(rule, {
            priority: highestPriority,
            entity: entityPath,
            keepDeletions: parentRule.keepDeletions
        });
    };

    let trackChange = (rule, change) => Object.assign({
        plugin: rule.plugin,
        priority: rule.priority
    }, change);

    let replaceChanges = function(rules, changes, newChanges) {
        changes.splice(0, changes.length);
        newChanges.forEach(change => {
            let rule = resolveRule(rules, change.path);
            changes.push(trackChange(rule, change));
        });
    };

    let getPreviousChange = function(changes, newChange) {
        return changes.find(change => newChange.sortPath === change.sortPath);
    };

    let handleChange = {
        Removed: function(rule, changes, newChange) {
            if (!rule.keepDeletions) return;
            changes.push(trackChange(rule, newChange));
        },
        Created: function(rule, changes, newChange) {
            changes.push(trackChange(rule, newChange));
        },
        Changed: function(rule, changes, newChange) {
            let prevChange = getPreviousChange(changes, newChange);
            if (prevChange && prevChange.priority > rule.priority) return;
            if (prevChange) changes.remove(prevChange);
            changes.push(trackChange(rule, newChange));
        }
    };

    let handleEntity = function(rule, changes) {
        changes.filterSelf(change => {
            return !change.sortPath.startsWith(rule.entity);
        });
    };

    // TODO: handle overrideDeletions?
    let mergeRecordChanges = function(rules, changes, newChanges) {
        if (!rules.process) return;
        if (rules.entity) return replaceChanges(rules, changes, newChanges);
        newChanges.forEach(newChange => {
            let rule = resolveRule(rules, newChange.path);
            if (!rule.process) return;
            if (rule.entity) return handleEntity(rule, changes);
            handleChange[newChange.type](rule, changes, newChange);
        });
    };

    let getPluginMasters = function(filename) {
        let plugin = $rootScope.loadOrder.findByKey('filename', filename);
        return plugin.masterNames;
    };

    let removeSupersededMasterChanges = function(rules, masterChanges, plugin) {
        let masterNames = getPluginMasters(plugin.filename);
        changes.filterSelf(change => {
            if (!masterNames.includes(change.plugin)) return;
            let rule = resolveRule(rules, change.path);
            return rule.process && change.priority <= rule.priority;
        });
    };

    // public
    this.mergeChanges = function(patch, excludeRecord) {
        return patch.plugins.reduce((changes, plugin) => {
            let cache = pluginDiffCacheService.getCache(plugin),
                rules = smashRuleService.resolveRules(patch, plugin);
            if (!cache) throw new Error(`Cache not found for ${plugin.filename}`);
            Object.keys(cache).forEach(masterName => {
                if (!changes[masterName]) changes[masterName] = {};
                let cachedChanges = cache[masterName],
                    masterChanges = changes[masterName];
                removeSupersededMasterChanges(rules, masterChanges, plugin);
                cachedChanges.forEach(change => {
                    let {formId} = change,
                        fullPath = `&${formId}\\${change.path}`;
                    change.element = xelib.GetElement(pluginFile, fullPath);
                    change.sortPath = xelib.SortPath(change.element);
                    if (excludeRecord && excludeRecord(formId)) return;
                    if (!masterChanges[formId])
                        masterChanges[formId] = [];
                    let recordChanges = masterChanges[formId];
                    mergeRecordChanges(rules[sig], recordChanges, change);
                });
            });
        }, {});
    };
});
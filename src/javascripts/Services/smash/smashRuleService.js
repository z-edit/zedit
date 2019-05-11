ngapp.service('smashRuleService', function(gameService) {
    let service = this;

    let rulesCache = {
        BaseRules: {},
        PluginRules: {}
    };

    // private
    let getRulesFolderPath = function(rulesFolder) {
        return fh.jetpack.path('smash', gameService.appName, rulesFolder);
    };

    let loadRulesFile = function(rulesType, rulesFile) {
        let rulesFolderPath = getRulesFolderPath(rulesType),
            rulesFilePath = fh.path(rulesFolderPath, rulesFile),
            rules = fh.loadJsonFile(rulesFilePath) || {};
        rules.rulesType = rulesType.slice(0, -5);
        rulesCache[rulesType][rulesFile] = rules;
        return rules;
    };

    let shouldChangeBase = function(patch, baseRules, pluginRules) {
        return patch.ruleFile !== pluginRules.baseRule.filename ||
            baseRules.version !== pluginRules.baseRule.version;
    };

    let changeBase = function(pluginRules, baseRules) {
        // TODO do a thing
    };

    // public
    this.resolveRules = function(patch, plugin) {
        let baseRules = service.getRulesFile('BaseRules', patch.rulesFile),
            pluginRules = service.getRulesFile('PluginRules', plugin.rulesFile);
        if (shouldChangeBase(patch, baseRules, pluginRules))
            pluginRules = changeBase(pluginRules, baseRules);
        return Object.deepAssign({
            plugin: plugin.filename
        }, baseRules.records, pluginRules.records);
    };

    this.getRulesFile = function(rulesType, rulesFile) {
        return rulesCache[rulesType][rulesFile] ||
            loadRulesFile(rulesType, rulesFile);
    };

    this.getRulesList = function(rulesType) {
        let rulesFolderPath = getRulesFolderPath(rulesType);
        fh.jetpack.dir(rulesFolderPath);
        return fh.jetpack.find(rulesFolderPath, { matching: '*.json' })
            .map(filePath => ({ filename: fh.getFileName(filePath) }));
    };

    this.newRule = function(rulesType) {
        return {
            rulesType: rulesType,
            name: `New ${rulesType} Rule`,
            created: new Date(),
            updated: new Date(),
            version: '0.0.0',
            description: `A new ${rulesType} rule.`,
            records: {}
        };
    };
});
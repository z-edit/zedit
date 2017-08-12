ngapp.service('stylesheetService', function() {
    var mainStylesheet = document.styleSheets[1];

    this.getRule = function(selector) {
        let rules = mainStylesheet.cssRules;
        for (let j = 0; j < rules.length; j++) {
            let rule = rules[j];
            if (rule.selectorText == selector) return rule;
        }
    };

    this.makeRule = function(selector, style) {
        mainStylesheet.addRule(selector, style, 1);
    };
});
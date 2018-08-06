ngapp.service('stylesheetService', function() {
    let service = this,
        lastIndex = document.styleSheets.length - 1,
        customStylesheet = document.styleSheets[lastIndex];

    this.getRule = function(selector) {
        let rules = customStylesheet.cssRules;
        for (let j = 0; j < rules.length; j++) {
            let rule = rules[j];
            if (rule.selectorText === selector) return rule;
        }
    };

    this.makeRule = function(selector, style) {
        customStylesheet.addRule(selector, style, 1);
    };

    this.setProperty = function(selector, property, value) {
        let rule = service.getRule(selector);
        if (!rule) {
            service.makeRule(selector, `${property}: ${value}`);
        } else {
            rule.style[property] = value;
        }
    };
});

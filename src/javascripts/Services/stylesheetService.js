ngapp.service('stylesheetService', function() {
    var service = this;
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

    this.setProperty = function(selector, property, value) {
        let rule = service.getRule(selector);
        if (!rule) {
            service.makeRule(selector, `${property}: ${value}`);
        } else {
            rule.style[property] = value;
        }
    };
});
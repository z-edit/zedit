export default function(ngapp) {
    ngapp.service('stylesheetService', function() {
        this.getStylesheet = function(index) {
            return document.styleSheets[index];
        };

        this.getRule = function(styleSheet, selector) {
            let rules = styleSheet.cssRules || styleSheet.rules;
            for (let j = 0; j < rules.length; j++) {
                let rule = rules[j];
                if (rule.selectorText == selector) return rule;
            }
        };

        this.makeRule = function(styleSheet, selector, style) {
            styleSheet.addRule(selector, style, 1);
        };
    });
}
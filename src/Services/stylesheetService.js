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

        this.makeRule = function(stylesheet, selector) {
            let rules = styleSheet.cssRules || styleSheet.rules;
            rules.addRule(selector, "", 1);
        };
    });
}
ngapp.service('codeMirrorFactory', function() {
    let factory = this,
        options = {
            js: {
                lineNumbers: true,
                mode: 'javascript'
            }
        };

    this.theme = 'default';

    this.getOptions = function(label) {
        let opts = options[label];
        opts.theme = factory.theme;
        return opts;
    };
});
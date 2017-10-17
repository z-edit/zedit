ngapp.service('clipboardService', function() {
    let clipboard;

    this.copy = function(source, nodes) {
        clipboard = {
            source: source,
            nodes: nodes.slice()
        };
    };

    this.hasClipboard = () => { return !!clipboard };
    this.getCopySource = () => { return clipboard.source };
    this.getNodes = () => { return clipboard.nodes };
});

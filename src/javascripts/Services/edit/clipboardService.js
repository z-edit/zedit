ngapp.service('clipboardService', function() {
    let _clipboard;

    this.copyNodes = function(source, nodes) {
        if (nodes.length === 0) return;
        if (_clipboard)
            _clipboard.nodes.mapOnKey('handle').forEach(xelib.Release);
        _clipboard = {
            source: source,
            nodes: nodes.slice()
        };
    };

    this.copyText = function(text) {
        _clipboard = undefined;
        clipboard.writeText(text);
    };

    this.hasClipboard = () => !!_clipboard;
    this.getCopySource = () => _clipboard.source;
    this.getNodes = () => _clipboard.nodes;
});

ngapp.service('buttonService', function() {
    let buttons = [];

    this.addButton = function(button) {
        buttons.push(button);
        buttons.sortOnKey('priority');
    };

    this.getButtons = () => buttons.slice();
});

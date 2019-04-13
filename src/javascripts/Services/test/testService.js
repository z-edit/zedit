ngapp.service('testService', function() {
    // private
    let getNewTestName = function() {
        return;
    };

    // public
    this.newTest = () => ({
        name: getNewTestName(),
        testFiles: []
    });

    this.saveTests = function() {

    };

    this.loadTests = function() {

    };
});
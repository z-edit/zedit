let {showProgress, logMessage, progressTitle,
     addProgress, progressMessage} = zedit.progressService;

let targetDuration = 5, // duration in seconds
    numOperations = targetDuration * 10;

showProgress({
    determinate: true,
    title: '?_?',
    message: '...',
    current: 0,
    max: numOperations,
    log: [],
    keepOpen: true
});

// ~0.1 seconds
let doLongOperation = function() {
    for (let i = 0; i < 800; i++) {
        let j = 0;
        while (++j < i * i) {}
    }
};

logMessage('Let\'s do some stuff!');
progressTitle('Doing Stuff');

// ~10s
for (let i = 0; i < numOperations; i++) {
    logMessage(`Stuff #${i}`);
    doLongOperation();
    addProgress(1);
    if (i === 5) progressMessage('Herp');
    if (i === 10) progressMessage('Derp');
}

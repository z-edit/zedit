let targetDuration = 5, // duration in seconds
    numOperations = targetDuration * 10;

ShowProgress({
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

LogMessage('Let\'s do some stuff!');
ProgressTitle('Doing Stuff');

// ~10s
for (let i = 0; i < numOperations; i++) {
    LogMessage(`Stuff #${i}`);
    doLongOperation();
    AddProgress(1);
    if (i === 5) ProgressMessage('Herp');
    if (i === 10) ProgressMessage('Derp');
}
let targetDuration = 5, // duration in seconds
    numOperations = targetDuration * 10;

zedit.ShowProgress({
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

zedit.LogMessage('Let\'s do some stuff!');
zedit.ProgressTitle('Doing Stuff');

// ~10s
for (let i = 0; i < numOperations; i++) {
    zedit.LogMessage(`Stuff #${i}`);
    doLongOperation();
    zedit.AddProgress(1);
    if (i === 5) zedit.ProgressMessage('Herp');
    if (i === 10) zedit.ProgressMessage('Derp');
}
const start = new Date();

const totalIterations = 30,
      records = xelib.GetRecords(0, 'WEAP,ARMO,MISC'),
      numCalls = totalIterations * records.length,
      afterLoad = new Date(); 

console.log(`Calling xelib.FullName ${numCalls} times...`);
for (let i = 0; i < totalIterations; i++) {
    for (let rec of records) {
        xelib.FullName(rec);
    }
}

const completed = new Date(),
      totalDuration = completed - start,
      loadDuration = afterLoad - start,
      fullNameDuration = completed - afterLoad,
      timePerCall = (fullNameDuration / numCalls) * 1000;

console.log(`Completed in ${totalDuration}ms`);
console.log(`Records loaded in ${loadDuration}ms`);
console.log(`Full name time ${fullNameDuration}ms`);
console.log(`${timePerCall.toFixed(1)}μs per call`);
/* This script replaces the substrings in the model path string. */

/* You can change this variables */
const replaceWhat= 'armor'; // replace what substring
const replaceWith = 'armor'; // replace with substring
const isFirstEntryOnly = true; // change only the first found replaceWhat substring?
const isSkipExistence = false; // skip checking for replaceWith substring existence in model path?
// paths to model to be changed
const modelPaths = 'Model\\MODL,Male biped model\\MODL,Male world model\\MOD2,Female biped model\\MOD3,Female world model\\MOD4,Female world model\\MOD4,Male 1st Person\\MOD4,Female 1st Person\\MOD5';
/*  */

const records = zedit.GetSelectedNodes();
const paths = modelPaths.split(',');

records.forEach((record) => {
    const handle = record.handle;

    paths.forEach((path) => {
        const value = xelib.GetValue(handle, path).toLowerCase();

        if (value) {
            if (isSkipExistence || !value.includes(replaceWith.toLowerCase())) {
                xelib.SetValue(
                    handle,
                    path,
                    isFirstEntryOnly
                        ? value.replace(replaceWhat, replaceWith.toLowerCase())
                        : value.replaceAll(replaceWhat, replaceWith.toLowerCase())
                );
            }
        }
    })
});

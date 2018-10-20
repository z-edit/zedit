const gulp = require('gulp');
const jetpack = require('fs-jetpack');

global.window = {};
require('../src/javascripts/extensions');

let docs;

let buildArrayValueDocs = function(label, path, subpath = '', handleLabel = 'record', extraArgs = null) {
    let descLabel = label.humanize();
    let matchStr = '`value`';
    if (subpath) matchStr += ` at \`${subpath}\``;
    let argNotes = [`setting \`${subpath}\` to \`value\``];
    let argObjects = [{
        name: handleLabel,
        type: 'handle'
    }, {
        name: 'value',
        type: 'string'
    }];

    if (extraArgs) {
        extraArgs.forEach(function(arg, index) {
            argObjects.push({ name: `value${index + 2}`, type: 'string' });
            argNotes.push(`\`${arg}\` to \`value${index + 2}\``);
        });
    }

    docs.push({
        name: `Has${label}`,
        args: [{
            name: handleLabel,
            type: 'handle'
        }, {
            name: 'value',
            type: 'string'
        }],
        returns: {
            type: 'boolean'
        },
        description: `Returns true if the \`${path}\` array on \`${handleLabel}\` has an element matching ${matchStr}.`
    }, {
        name: `Get${label}`,
        args: [{
            name: handleLabel,
            type: 'handle'
        }, {
            name: 'value',
            type: 'string'
        }],
        returns: {
            type: 'handle'
        },
        description: `Finds the first item in the \`${path}\` array on \`${handleLabel}\` matching ${matchStr}.  Returns a handle to the element if found, else returns \`0\`.`
    }, {
        name: `Add${label}`,
        args: argObjects,
        returns: {
            type: 'handle'
        },
        description: `Adds an item to the \`${path}\` array on \`${handleLabel}\`, ${argNotes.joinList()}.  Returns a handle to the added ${descLabel} element.`
    }, {
        name: `Remove${label}`,
        args: [{
            name: handleLabel,
            type: 'handle'
        }, {
            name: 'value',
            type: 'string'
        }],
        description: `Removes the first item in the \`${path}\` array on \`${handleLabel}\` matching ${matchStr}.`
    });
};

let buildValueDocs = function(label, path) {
    docs.push({
        name: `Get${label}`,
        args: [{
            name: 'record',
            type: 'handle'
        }],
        returns: {
            type: 'number'
        },
        description: `Returns the value at \`${path}\` on \`record\`.`
    }, {
        name: `Set${label}`,
        args: [{
            name: 'record',
            type: 'handle'
        }, {
            name: 'value',
            type: 'number'
        }],
        description: `Sets the value at \`${path}\` on \`record\` to \`value\`.`
    })
};

let buildFlagDocs = function(label, path, flagName) {
    docs.push({
        name: `Get${label}`,
        args: [{
            name: 'record',
            type: 'handle'
        }],
        returns: {
            type: 'boolean'
        },
        description: `Returns the state of flag ${flagName} at \`${path}\` on \`record\`.`
    }, {
        name: `Set${label}`,
        args: [{
            name: 'record',
            type: 'handle'
        }, {
            name: 'state',
            type: 'boolean'
        }],
        description: `Sets flag ${flagName} at \`${path}\` on \`record\` to \`state\`.`
    });
};

gulp.task('generateCommonDocs', function() {
    docs = [];

    // COMMON ARRAY FUNCTIONS
    buildArrayValueDocs('Keyword', 'Keywords');
    buildArrayValueDocs('FormID', 'FormIDs');
    buildArrayValueDocs('MusicTrack', 'Music Tracks');
    buildArrayValueDocs('Footstep', 'Footstep Sets');
    buildArrayValueDocs('AdditionalRace', 'Additional Races');
    buildArrayValueDocs('Effect', 'Effects', 'EFID - Base Effect', 'record',
        ['EFIT\\Magnitude', 'EFIT\\Area', 'EFIT\\Duration']);
    buildArrayValueDocs('Item', 'Items', 'CNTO\\Item', 'record',
        ['CNTO\\Count']);
    buildArrayValueDocs('LeveledEntry', 'Leveled List Entries',
        'LVLO\\Reference', 'record', ['LVLO\\Level', 'LVLO\\Count']);
    buildArrayValueDocs('Script', 'VMAD\\Scripts', 'scriptName',
        'record', ['Flags']);
    buildArrayValueDocs('ScriptProperty', 'Properties', 'propertyName',
        'scriptElement', ['Type', 'Flags']);
    buildArrayValueDocs('Condition', 'Conditions', 'CTDA\\Function', 'record',
        ['CTDA\\Type', 'CTDA\\Comparison Value', 'CTDA\\Parameter #1']);

    // COMMON VALUE GETTERS AND SETTERS
    buildValueDocs('GoldValue', 'DATA\\Value');
    buildValueDocs('Weight', 'DATA\\Weight');
    buildValueDocs('Damage', 'DATA\\Damage');
    buildValueDocs('ArmorRating', 'DNAM');

    // COMMON FLAG GETTERS AND SETTERS
    buildFlagDocs('IsFemale', 'ACBS\\Flags', 'Female');
    buildFlagDocs('IsEssential', 'ACBS\\Flags', 'Essential');
    buildFlagDocs('IsUnique', 'ACBS\\Flags', 'Unique');

    // EXPORT TO DISK
    jetpack.write('app/docs/development/apis/xelib/common.json', docs);
});

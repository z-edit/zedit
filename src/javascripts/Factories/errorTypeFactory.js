ngapp.service('errorTypeFactory', function () {
    this.errorTypes = function () {
        return [
            {
                group: 0,
                name: "Identical to Master Records",
                acronym: "ITM",
                caption: "ITMs are records that have been overridden in a plugin file but haven't been change relative to their master record.",
                benign: true,
                errors: []
            },
            {
                group: 1,
                name: "Identical to Previous Override Records",
                acronym: "ITPO",
                caption: "ITPOs are records that have been overridden in a plugin file that haven't been changed relative to their previous override.",
                benign: true,
                errors: []
            },
            {
                group: 2,
                name: "Deleted Records",
                acronym: "DR",
                caption: "DRs are records which have been marked as deleted with either their subrecords still present or the chance to cause CTDs when referenced.",
                errors: []
            },
            {
                group: 3,
                name: "Unexpected Subrecords",
                acronym: "UES",
                caption: "UESs are errors where the data structure of a record is abnormal.",
                benign: true,
                errors: []
            },
            {
                group: 4,
                name: "Unresolved References",
                acronym: "URR",
                caption: "URRs are errors where a record references another record that doesn't exist.",
                benign: true,
                errors: []
            },
            {
                group: 5,
                name: "Unexpected References",
                acronym: "UER",
                caption: "UERs are errors where a record references another record in an abnormal fashion.",
                benign: true,
                errors: []
            },
            {
                group: 6,
                name: "Other Errors",
                acronym: "OE",
                caption: "Errors that don't fall into the other groups are placed in this group.",
                benign: true,
                errors: []
            }
        ];
    };
});

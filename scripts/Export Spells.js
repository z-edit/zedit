let allSpells = xelib.GetRecords(0, 'SPEL'),
    sortedSpells = {
        Alteration: [],
        Conjuration: [],
        Destruction: [],
        Illusion: [],
        Restoration: [],
    },
    perkSuffixes = ['Novice00', 'Apprentice25', 'Adept50', 'Expert75', 'Master100'],
    perkExpr = new RegExp(`^([a-zA-Z]+)(${perkSuffixes.join('|')})$`),
    output = '';

let getSpellSchool = function(spell) {
    const halfCostPerkPath = 'SPIT\\Half-cost perk';
    if (!xelib.HasElement(spell, halfCostPerkPath)) return;
    if (xelib.GetUIntValue(spell, halfCostPerkPath) === 0) return;
    let halfCostPerk = xelib.GetLinksTo(spell, halfCostPerkPath),
        match = perkExpr.exec(xelib.EditorID(halfCostPerk));
    return match && match[1];
};

allSpells.forEach(function(spell) {
    let school = getSpellSchool(spell);
    if (!school) return;
    sortedSpells[school].push(xelib.Name(spell));
});

Object.keys(sortedSpells).forEach(function(school) {
    output += `== ${school} ==\r\n`;
    sortedSpells[school].forEach((spell) => output += `- ${spell}\r\n`);
});

console.log(output);
# zSmash - Record Composition

## Requirements

The composite needs to:

- track priority of changes
- track source of changes
- structure changes for fast and easy access
- track overwritten changes
- track overwrite source
- track overwrite reason

## Example 1: Different subrecords

### Changes for Plugin1.esp

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": [
                {
                    "path": "FULL",
                    "type": "Changed",
                    "value": "Helmet - Iron"
                }
            ]
        }
    }
}
```

### Changes for Plugin2.esp

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": [
                {
                    "path": "DNAM",
                    "type": "Changed",
                    "value": "72"
                }
            ]
        }
    }
}
```

### Composite

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "elements": {
                "FULL": {
                    "changes": [{
                        "source": "Plugin1.esp",
                        "type": "Changed",
                        "value": "Helmet - Iron",
                        "priority": 0
                    }]
                },
                "DNAM": {
                    "changes": [{
                        "source": "Plugin2.esp",
                        "type": "Changed",
                        "value": "72",
                        "priority": 0
                    }]
                }
            }
        }
    }
}
```

## Example 2: Different subrecord, no merge

### Composite

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "elements": {
                "FULL": {
                    "overwrittenChanges": [{
                        "source": "Plugin1.esp",
                        "overwrittenBy": "Plugin2.esp",
                        "overwriteReason": "noMerge",
                        "type": "Changed",
                        "value": "Helmet - Iron",
                        "priority": 0
                    }]
                },
                "DNAM": {
                    "changes": [{
                        "source": "Plugin2.esp",
                        "type": "Changed",
                        "value": "72",
                        "priority": 0
                    }]
                }
            }
        }
    }
}
```

## Example 3: Same subrecord

### Changes for Plugin1.esp

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": [
                {
                    "path": "DNAM",
                    "type": "Changed",
                    "value": "39"
                }
            ]
        }
    }
}
```

### Changes for Plugin2.esp

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": [
                {
                    "path": "DNAM",
                    "type": "Changed",
                    "value": "72"
                }
            ]
        }
    }
}
```

### Composite

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "elements": {
                "DNAM": {
                    "changes": [{
                        "source": "Plugin2.esp",
                        "type": "Changed",
                        "value": "72",
                        "priority": 0
                    }],
                    "overwrittenChanges": [{
                        "source": "Plugin1.esp",
                        "overwrittenBy": "Plugin2.esp",
                        "overwriteReason": "loadOrder",
                        "type": "Changed",
                        "value": "39",
                        "priority": 0
                    }]
                }
            }
        }
    }
}
```

## Example 4: Subrecord created by two different plugins

### Changes for Plugin1.esp

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": [
                {
                    "path": "EDID",
                    "type": "Added"
                },
                {
                    "path": "EDID",
                    "type": "Changed",
                    "value": "ArmorIronHelmet100"
                }
            ]
        }
    }
}
```

### Changes for Plugin2.esp

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": [
                {
                    "path": "EDID",
                    "type": "Added"
                },
                {
                    "path": "EDID",
                    "type": "Changed",
                    "value": "ArmorIronHelmet200"
                }
            ]
        }
    }
}
```

### Composite

```json
{
    
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "elements": {
                "EDID": {
                    "changes": [{
                        "source": "Plugin1.esp",
                        "type": "Added",
                        "priority": 0
                    }, {
                        "source": "Plugin2.esp",
                        "type": "Added",
                        "priority": 0
                    }, {
                        "source": "Plugin2.esp",
                        "type": "Changed",
                        "value": "ArmorIronHelmet200",
                        "priority": 0
                    }],
                    "overwrittenChanges": [{
                        "source": "Plugin1.esp",
                        "overwrittenBy": "Plugin2.esp",
                        "overwriteReason": "loadOrder",
                        "type": "Changed",
                        "value": "ArmorIronHelmet100",
                        "priority": 0
                    }]
                }
            }
        }
    }
}
```

## Example 5: Subrecord removed

### Changes for Plugin1.esp

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": [
                {
                    "path": "EDID",
                    "type": "Changed",
                    "value": "ArmorIronHelmet100"
                }
            ]
        }
    }
}
```

### Changes for Plugin2.esp

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": [
                {
                    "path": "EDID",
                    "type": "Removed"
                }
            ]
        }
    }
}
```

### Composite

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "elements": {
                "EDID": {
                    "changes": [{
                        "source": "Plugin2.esp",
                        "type": "Removed",
                        "priority": 0
                    }],
                    "overwrittenChanges": [{
                        "source": "Plugin1.esp",
                        "overwrittenBy": "Plugin2.esp",
                        "overwriteReason": "removed",
                        "type": "Changed",
                        "value": "ArmorIronHelmet100",
                        "priority": 0
                    }]
                }
            }
        }
    }
}
```

## Example 6: Subrecord removed and recreated

### Changes for Master.esm

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": [
                {
                    "path": "EDID",
                    "type": "Removed"
                }
            ]
        }
    }
}
```

### Changes for Plugin.esp

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": []
        }
    }
}
```

### Composite

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "elements": {
                "EDID": {
                    "changes": [],
                    "overwrittenChanges": [{
                        "source": "Master.esm",
                        "overwrittenBy": "Plugin.esp",
                        "overwriteReason": "restored",
                        "type": "Removed",
                        "priority": 0
                    }]
                }
            }
        }
    }
}
```

## Example 7: Priority overwrite

### Changes for Plugin1.esp

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": [
                {
                    "path": "DNAM",
                    "type": "Changed",
                    "value": "39",
                    "priority": 2
                }
            ]
        }
    }
}
```

### Changes for Plugin2.esp

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": [
                {
                    "path": "DNAM",
                    "type": "Changed",
                    "value": "72"
                }
            ]
        }
    }
}
```

### Composite

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "elements": {
                "DNAM": {
                    "changes": [{
                        "source": "Plugin1.esp",
                        "type": "Changed",
                        "value": "39",
                        "priority": 2
                    }],
                    "overwrittenChanges": [{
                        "source": "Plugin2.esp",
                        "overwrittenBy": "Plugin1.esp",
                        "overwriteReason": "priority",
                        "type": "Changed",
                        "value": "72",
                        "priority": 0
                    }]
                }
            }
        }
    }
}
```

## Example 8: Struct

### Changes for Plugin1.esp

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": [
                {
                    "path": "DATA\\Weight",
                    "type": "Changed",
                    "value": "0"
                }
            ]
        }
    }
}
```

### Changes for Plugin2.esp

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": [
                {
                    "path": "DATA\\Value",
                    "type": "Changed",
                    "value": "999"
                }
            ]
        }
    }
}
```

### Composite

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "elements": {
                "DATA": {
                    "elements": {
                        "Weight": {
                            "changes": [{
                        	    "source": "Plugin1.esp",
                                "type": "Changed",
                                "value": "0",
                                "priority": 0
                            }]
                        },
                        "Value": {
                            "changes": [{
                                "source": "Plugin2.esp",
                                "type": "Changed",
                                "value": "999",
                                "priority": 0
                            }]
                        }
                    }
                }
            }
        }
    }
}
```

## Example 9: Struct, overwrite

### Changes for Plugin1.esp

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": [
                {
                    "path": "DATA\\Weight",
                    "type": "Changed",
                    "value": "0"
                }
            ]
        }
    }
}
```

### Changes for Plugin2.esp

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": [
                {
                    "path": "DATA\\Value",
                    "type": "Changed",
                    "value": "999"
                }
            ]
        }
    }
}
```

### Composite

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "elements": {
                "DATA": {
                    "elements": {
                        "Weight": {
                            "overwrittenChanges": [{
                                "source": "Plugin1.esp",
                                "overwrittenBy": "Plugin2.esp",
                                "overwriteReason": "overwrite",
                                "type": "Changed",
                                "value": "0",
                                "priority": 0
                            }]
                        },
                        "Value": {
                            "changes": [{
                                "source": "Plugin2.esp",
                                "type": "Changed",
                                "value": "999",
                                "priority": 0
                            }]
                        }
                    }
                }
            }
        }
    }
}
```

## Example 10: Sorted Array

### Changes for Plugin1.esp

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": [
                {
                    "path": "Items\\{00098765}",
                    "type": "Added"
                }
            ]
        }
    }
}
```

### Changes for Plugin2.esp

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "changes": [
                {
                    "path": "Items\\{000ABCDE}",
                    "type": "Added"
                }
            ]
        }
    }
}
```

### Composite

```json
{
    "Skyrim.esm": {
        "00012345": {
            "sig": "ARMO",
            "elements": {
                "Items": {
                    "elements": {
                        "{00098765}": {
                            "changes": [{
                                "source": "Plugin1.esp",
                                "type": "Added",
                                "priority": 0
                            }]
                        },
                        "{000ABCDE}": {
                            "changes": [{
                                "source": "Plugin2.esp",
                                "type": "Added",
                                "priority": 0
                            }]
                        }
                    }
                }
            }
        }
    }
}
```

## Example 11: Unsorted Array

## Example 12: Sorted array, overwrite

## Example 13: Sorted array, nested changes



## Algorithm

When we are processing a given record from a given plugin diff, we need to do the following:

1. if the record is set to restore deleted elements/reverse changes, process all changes appropriately
2. iterate through the changes:
   - resolve computed rule for change
   - resolve composite context for change
   - verify the rule says to process the change.  if it doesn't, put the change in `overwrittenChanges` with overwrite reason set to `skipped`.
   - if rule says to overwrite changes, move all changes from changes to `overwrittenChanges` with overwrite reason set to `overwritten`.
   - if change type is "Removed":
     1. if the rule does not say to forward deletions, put the change in `overwrittenChanges` with overwrite reason set to `deletionSkipped` and skip remaining steps.
     2. if a higher priority change exists, put the change in `overwrittenChanges` with overwrite reason set to `priority` and skip remaining steps.
     3. move changes with types of "Added" or "Changed" to `overwrittenChanges` with overwrite reason set to `removed`.
     4. add to changes
   - if change type is "Added":
     1. if a change with type "Removed" exists with greater or equal priority, put the change in `overwrittenChanges` with overwrite reason set to `removed` and skip remaining steps.
     2. if a higher priority change exists, put the change in `overwrittenChanges` with overwrite reason set to `priority` and skip remaining steps.
     3. move changes with type "Removed" to `overwrittenChanges` with overwrite reason set to `restored`.
     4. add to changes
   - if change type is "Changed":
     1. if a change with type "Removed" exists with greater or equal priority, put the change in `overwrittenChanges` with overwrite reason set to `removed` and skip remaining steps.
     2. if a higher priority change exists, put the change in `overwrittenChanges` with overwrite reason set to `priority` and skip remaining steps.
     3. move changes with type "Changed" to `overwrittenChanges` with overwrite reason set to `loadOrder`.
     4. add to changes


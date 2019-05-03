
# zSmash Implementation

## Patch object schema
- `name` - The name of the patch, used for the folder name.
- `filename` - The filename of the patch used for the plugin.
- `ruleFile` - The filename of the base rule file to use when building this patch.
- `patchType` - Either `Full load order patch` or `Patch specific plugins`.
- `method` - Either `Master` or `Winning override`.  Affects what record is copied when patching starts.  Defaults to master for patching full load orders and winning override for patching specific plugins.
- `plugins` - Array of objects for the plugins in the patch.  Each object has the following properties:
    - `filename` - The filename of the plugin.
    - `ruleFile` - The filename of the rule file to use when patching this plugin.  Can be `undefined`.
    - `hash` - The MD5 hash of the plugin.
- `addedPlugins` - Array of plugin filenames that were just added to the patch.  Gets cleared when the patch is built and saved to disk.
- `removedPlugins` - Array of plugin filenames that were just removed from the patch.  Gets cleared when the patch is built and saved to disk.
- `pluginExclusions` - Only present when `patchType` is `Full load order patch`.  Array of plugin filenames to exclude.
- `pluginInclusions` - Only present when `patchType` is `Patch specific plugins`.  Array of plugin filenames to include.

## Rules

### Base rule

JSON structure which serves as the base rule for all plugins being patched.

### Plugin rules

Per-plugin differences from the base rule.  When patching rules are taken from the base rule and then overridden by plugin rules.

## How rule changes are inferred

### Value copied
When value is not top level, user can toggle whether or not parent is treated as a single entity, adjusting options.

- Copied changed value (not last change)
  - Prioritize changes to {{target}} from {{this plugin}} **[default]**
  - Ignore changes to {{target}} in plugins: {{list of plugins with non-ITM values on target on this record, excluding this plugin}}
  - Set this value on this record
- Copied last changed value
  - {{if priority present on conflict loser}} 
    - Prioritize changes to {{target}} from {{this plugin}} (use higher priority than {{conflict loser plugin}}) **[default]**
    - Unprioritize changes to {{target}} from {{conflict loser plugin}}
  - {{if changes ignored on field in plugin}} 
    - Unignore changes to {{target}} from {{conflict winner plugin}} **[default]**
  - Set this value on this record
- Copied ITM value
  - Ignore change to this in plugins: {{list of plugins with non-ITM values on target on this record}} **[default]**
  - Set this value on this record

### Array entry restored

TODO

### Array entry removed

TODO

## Plugin diff cache schema

- `[masterName]` - Contains an array of objects which represent the differences between each override record and its original master record from `masterName`.  Each override object has the following properties:
  - `formId` - The local hexadecimal form ID of the record.
  - `changes` - Array of objects representing changes in the record relative to its master.  Each object has the following properties:
    - `path` - The local path to the element change.
    - `type` - The type of change.  Can be: `Created`, `Removed`, or `Changed`.
    - `value` - The string value to apply for the change.

## Merging differences
Assuming all plugins use the same resolution rules, when merging differences in a given override record we can ignore previous overrides and skip their processing.  We only need to process the final "leaves" of the record tree relative to the root.  E.g.

```
                  A
                 / \
                /   \
               B     C
              /     / \
             /     /   \
            /     /     \
           D     E       F
          / \             \
         /   \             \
        /     \             \
       G       H             I
                            / \
                           /   \
                          /     \
                         J       K
                          \     /
                           \   /
                            \ /
                             L
```

We only need to process:

- `E` relative to `A`
- `G` relative to `A`
- `H` relative to `A`
- `L` relative to `A`

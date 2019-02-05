# zSmash Design

## 1. User selects zSmash from application mode dropdown

## 2. View appears for user to create and manage smashed patches

View is pretty much the same as the merge view.  Each patch has a type - "full load order patch" or "patch specific plugins".  Full load order patch allows the user to exclude certain plugins from being loaded, where patch specific plugins allows the user to specify certain plugins to load.

## 3. Plugins are loaded, patch is loaded or generated

Initially, a basic "Smash.All" setting is used to generate the patch.  The user can then tweak things to adjust the behavior on a per-plugin basis.  Editing the base setting is also possible, for advanced users.

## 4. User is presented with a tree view (smashTreeView)

- Tree view only shows record groups in the smashed patch
- Context menu options:
  - Exclude from patch (top level group or record)
  - Manage exclusions
  - Regenerate patch
  - Show/Hide ITPOs
  - Open in smash record view (records)
  - Open in new smash record view (records)

## 5. User is presented with a record view (smashRecordView)

- Does not allow editing fields for plugins other than the smashed patch
- Hides unassigned fields by default
- Context menu options:
  - Show/Hide unassigned fields
  - Show/Hide non-conflicting rows
  - Copy value to patch (non-patch value cells)
  - Copy element to patch (non-patch element cells)
  - Remove element from patch (patch element cells)
  - Set custom value (patch value cells)
  - Use algorithm to set value (patch value cells)
  - Add custom entry (patch array cells)

After making a modfication to a record, smash will infer possible rule changes that would make sense for that modification and presents them to the user in a modal.

## 6. Final smash patch is saved to disk, user closes the program
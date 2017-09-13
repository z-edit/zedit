ngapp.service('hotkeyFactory', function() {
    this.mainTreeHotkeys = function() {
        return {
            rightArrow: 'handleRightArrow',
            leftArrow: 'handleLeftArrow',
            upArrow: 'handleUpArrow',
            downArrow: 'handleDownArrow',
            pageUp: 'handlePageUp',
            pageDown: 'handlePageDown',
            enter: 'handleEnter',
            delete: 'handleDelete',
            f: [{
                modifiers: ['ctrlKey', 'shiftKey'],
                callback: 'toggleAdvancedSearch'
            }, {
                modifiers: ['ctrlKey'],
                callback: 'toggleSearchBar'
            }]
        }
    };

    this.recordTreeHotkeys = function() {
        return {
            rightArrow: 'handleRightArrow',
            leftArrow: 'handleLeftArrow',
            upArrow: 'handleUpArrow',
            downArrow: 'handleDownArrow',
            pageUp: 'handlePageUp',
            pageDown: 'handlePageDown',
            f: [{
                modifiers: ['ctrlKey'],
                callback: 'toggleSearchBar'
            }],
            a: [{
                modifiers: ['ctrlKey'],
                callback: 'toggleAddressBar'
            }],
            r: [{
                modifiers: ['ctrlKey'],
                callback: 'toggleReplaceBar'
            }],
            f6: 'focusAddressInput'
        }
    };

    this.treeSearchHotkeys = function() {
        return {
            escape: 'closeSearch',
            enter: [{
                modifiers: ['shiftKey'],
                callback: 'previousResult'
            }, {
                modifiers: [],
                callback: 'nextResult'
            }],
            x: [{
                modifiers: ['altKey'],
                callback: 'toggleExact'
            }],
            else: [{
                modifiers: ['altKey'],
                callback: 'setSearchBy'
            }]
        }
    };

    this.contextMenuHotkeys = function() {
        return {
            rightArrow: 'handleRightArrow',
            leftArrow: 'handleLeftArrow',
            upArrow: 'handleUpArrow',
            downArrow: 'handleDownArrow',
            escape: 'closeMenu',
            enter: 'clickItem'
        }
    };

    this.dropdownHotkeys = function() {
        return {
            downArrow: 'toggleDropdown',
            enter: 'toggleDropdown'
        }
    };

    this.dropdownItemsHotkeys = function() {
        return {
            upArrow: 'handleUpArrow',
            downArrow: 'handleDownArrow',
            escape: 'handleEscape',
            enter: 'handleEnter'
        }
    };

    this.listViewHotkeys = function() {
        return {
            upArrow: 'handleUpArrow',
            downArrow: 'handleDownArrow',
            space: 'handleSpace',
            escape: 'clearSelection',
            enter: 'handleEnter',
            a: [{
                modifiers: ['ctrlKey'],
                callback: 'selectAll'
            }]
        }
    };
});

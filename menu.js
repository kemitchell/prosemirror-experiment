var commands = require('prosemirror-commands')
var menu = require('prosemirror-menu')

module.exports = function (schema) {
  return menu.menuBar({
    floating: true,
    content: [
      [
        // Insert Blank
        new menu.MenuItem({
          title: 'Insert Blank',
          label: 'Blank',
          enable: function () {
            return function (state, nodeType) {
              // TODO
              return true
            }
          },
          run: function (state, _, view) {
            // TODO
          }
        }),
        markToggleMenuItem(schema.marks.definition, 'Definition'),
        markToggleMenuItem(schema.marks.use, 'Use'),
        markToggleMenuItem(schema.marks.reference, 'Reference'),
        new menu.MenuItem({
          title: 'Insert Blank',
          label: 'Blank',
          enable: function (state) { return insertBlank(state) },
          run: insertBlank
        })
      ],
      [
        menu.undoItem,
        menu.redoItem
      ]
    ]
  })

  function insertBlank (state, dispatch) {
    var blank = schema.nodes.blank
    var $from = state.selection.$from
    var index = $from.index
    if (!$from.parent.canReplaceWith(index, index, blank)) return false
    if (dispatch) {
      dispatch(state.tr.replaceSelectionWith(blank.create()))
    }
    return true
  }
}

function markToggleMenuItem (mark, title) {
  return new menu.MenuItem({
    title: title,
    label: title,
    active: function () {
      return function (state, nodeType) {
        return isMarkActive(state, mark)
      }
    },
    enable: function (state) {
      return !state.selection.empty
    },
    run: commands.toggleMark(mark)
  })
}

function isMarkActive (state, nodeType) {
  var selection = state.selection
  if (selection.empty) {
    var marks = state.storedMarks || selection.$from.marks()
    return nodeType.isInSet(marks)
  }
  return state.doc.rangeHasMark(selection.from, selection.to, nodeType)
}

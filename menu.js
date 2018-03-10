var toggleMark = require('prosemirror-commands').toggleMark
var menu = require('prosemirror-menu')

var commands = require('./commands')

module.exports = function (schema) {
  return menu.menuBar({
    floating: true,
    content: [
      [
        markToggleMenuItem(schema.marks.definition, 'Definition'),
        markToggleMenuItem(schema.marks.use, 'Use'),
        markToggleMenuItem(schema.marks.reference, 'Reference')
      ],
      [
        new menu.MenuItem({
          title: 'Insert Blank',
          label: 'Blank',
          enable: function (state) {
            return commands.insertBlank
          },
          run: commands.insertBlank
        })
      ],
      [
        menu.undoItem,
        menu.redoItem
      ]
    ]
  })
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
    run: toggleMark(mark)
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

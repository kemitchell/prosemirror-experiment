var pmCommands = require('prosemirror-commands')
var Node = require('prosemirror-model').Node

var schema = require('./schema')

exports.insertBlank = function (state, dispatch) {
  var blank = schema.nodes.blank
  var $from = state.selection.$from
  var index = $from.index
  if (!$from.parent.canReplaceWith(index, index, blank)) return false
  if (dispatch) {
    dispatch(state.tr.replaceSelectionWith(blank.createAndFill()))
  }
  return true
}

exports.insertChild = function (state, dispatch, view) {
  var $cursor = state.selection.$cursor
  if (!$cursor || !view.endOfTextblock('forward')) return false
  if (dispatch) {
    dispatch(state.tr.replaceSelectionWith(newForm(schema)))
  }
  return true
}

exports.splitParagraph = function (state, dispatch, view) {
  // TODO
  return false
}

exports.insertSibling = function (state, dispatch, view) {
  var $cursor = state.selection.$cursor
  if (!$cursor || !view.endOfTextblock('forward')) return false
  if (dispatch) {
    dispatch(
      state.tr.insert(state.selection.$to, newForm(schema))
    )
  }
  return true
}

exports.backspace = pmCommands.chainCommands(
  pmCommands.deleteSelection,
  pmCommands.joinBackward,
  pmCommands.selectNodeBackward
)

exports.delete = pmCommands.chainCommands(
  pmCommands.deleteSelection,
  pmCommands.joinForward,
  pmCommands.selectNodeForward
)

exports.enter = pmCommands.chainCommands(
  exports.insertSibling,
  exports.splitParagraph
)

exports.selectAll = pmCommands.selectAll

function newForm () {
  return Node.fromJSON(schema, {
    type: 'form',
    content: [
      {
        type: 'heading',
        content: [{type: 'text', text: 'New Heading'}]
      },
      {
        type: 'paragraph',
        content: [{type: 'text', text: '...'}]
      }
    ]
  })
}

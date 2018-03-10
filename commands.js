var pmModel = require('prosemirror-model')
var pmCommands = require('prosemirror-commands')
var pmState = require('prosemirror-state')

var Node = pmModel.Node
// var Selection = pmState.Selection
var TextSelection = pmState.TextSelection

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
  if (!$cursor) return false
  // TODO: Put selected nodes in new child.
  if (dispatch) {
    var newChild = newForm()
    var position = state.selection.$to.after()
    var tr = state.tr
    tr.insert(position, newChild)
    // Select heading in new child.
    tr.setSelection(
      TextSelection.create(
        tr.doc, position + 1,
        position + 1 + newChild.child(0).nodeSize
      )
    )
    tr.scrollIntoView()
    dispatch(tr)
  }
  return true
}

exports.insertSibling = function (state, dispatch, view) {
  var $cursor = state.selection.$cursor
  if (!$cursor || !view.endOfTextblock('forward')) return false
  if ($cursor.depth === 1) return false
  if (dispatch) {
    var newChild = newForm()
    var position = state.selection.$to.after(-1)
    var tr = state.tr
    tr.insert(position, newChild)
    // Select heading in new sibling.
    tr.setSelection(
      TextSelection.create(
        tr.doc, position + 1,
        position + 1 + newChild.child(0).nodeSize
      )
    )
    tr.scrollIntoView()
    dispatch(tr)
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

exports.selectAll = pmCommands.selectAll

exports.definition = pmCommands.toggleMark(schema.marks.definition)
exports.use = pmCommands.toggleMark(schema.marks.use)
exports.reference = pmCommands.toggleMark(schema.marks.reference)

var NEW_FORM_HEADING = 'New Heading'

function newForm () {
  return Node.fromJSON(schema, {
    type: 'form',
    content: [
      {
        type: 'heading',
        content: [textNode(NEW_FORM_HEADING)]
      },
      {
        type: 'paragraph',
        content: [textNode('...')]
      }
    ]
  })
}
function textNode (text) {
  return {type: 'text', text}
}

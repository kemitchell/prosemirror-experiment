var pmCommands = require('prosemirror-commands')
var pmModel = require('prosemirror-model')
var pmState = require('prosemirror-state')

var TextSelection = pmState.TextSelection
var Fragment = pmModel.Fragment

var schema = require('./schema')

var HEADING = schema.node('heading', null, [schema.text('New Heading')])
var PARAGRAPH = schema.node('paragraph', null, [schema.text('...')])
var FORM = schema.node('form', null, [HEADING, PARAGRAPH])

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
    var position = state.selection.$to.after()
    var tr = state.tr
    tr.insert(position, FORM)
    // Select heading in new child.
    tr.setSelection(
      TextSelection.create(
        tr.doc, position + 1,
        position + 1 + FORM.child(0).nodeSize
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
    var position = state.selection.$to.after(-1)
    var tr = state.tr
    tr.insert(position, FORM)
    // Select heading in new sibling.
    tr.setSelection(
      TextSelection.create(
        tr.doc, position + 1,
        position + 1 + FORM.child(0).nodeSize
      )
    )
    tr.scrollIntoView()
    dispatch(tr)
  }
  return true
}

exports.insertParagraph = function (state, dispatch, view) {
  var $cursor = state.selection.$cursor
  if (!$cursor) return false
  var parentForm = $cursor.node(-1)
  var fragment = Fragment.from([parentForm, PARAGRAPH])
  var grandparentForm = $cursor.node(-2)
  if (!grandparentForm) return false
  var grandparentContent = grandparentForm.content
  for (var index = 0; index < grandparentContent.size; index++) {
    if (fragment.child(index).eq(parentForm)) break
  }
  var canInsert = grandparentForm.canReplace(index, index, fragment)
  if (!canInsert) return false
  if (dispatch) {
    var tr = state.tr
    var position = $cursor.after(-1)
    tr.insert(position, PARAGRAPH)
    tr.setSelection(
      TextSelection.create(
        tr.doc, position + 1,
        position + 1 + PARAGRAPH.child(0).nodeSize
      )
    )
    tr.scrollIntoView()
    dispatch(tr)
  }
  return true
}

exports.insertHeading = function (state, dispatch, view) {
  var $cursor = state.selection.$cursor
  if (!$cursor) return false
  if (!view.endOfTextblock('left')) return false
  var parent = $cursor.parent
  if (parent.type.name === 'heading') return false
  var grandparent = $cursor.node(-1)
  var canPrependHeading = grandparent.canReplace(0, 0, schema.nodes.heading)
  if (!canPrependHeading) return false
  if (grandparent.type.name === 'doc') return false
  if (dispatch) {
    var tr = state.tr
    var position = $cursor.before()
    var heading = HEADING
    tr.insert(position, heading)
    tr.setSelection(
      TextSelection.create(
        tr.doc, position, position + heading.nodeSize
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

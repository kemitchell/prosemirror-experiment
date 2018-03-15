var EditorState = require('prosemirror-state').EditorState
var EditorView = require('prosemirror-view').EditorView
var dropCursor = require('prosemirror-dropcursor').dropCursor
var gapCursor = require('prosemirror-gapcursor').gapCursor
var history = require('prosemirror-history').history
var keymap = require('prosemirror-keymap').keymap
var pmModel = require('prosemirror-model')
var pmState = require('prosemirror-state')
var pmView = require('prosemirror-view')
var redo = require('prosemirror-history').redo
var undo = require('prosemirror-history').undo

var Decoration = pmView.Decoration
var DecorationSet = pmView.DecorationSet
var Plugin = pmState.Plugin
var Fragment = pmModel.Fragment

var menu = require('./menu')
var schema = require('./schema')

var commands = require('./commands')

var INITIAL_DOC = schema.node('doc', null, [
  schema.node('paragraph', null, [
    schema.text('This is a test.')
  ]),
  schema.node('form', {conspicuous: false}, [
    schema.node('heading', null, [
      schema.text('First Child')
    ]),
    schema.node('paragraph', null, [
      schema.text('First child text.')
    ])
  ]),
  schema.node('form', {conspicuous: false}, [
    schema.node('heading', null, [
      schema.text('Second Child')
    ]),
    schema.node('paragraph', null, [
      schema.text('First child text.')
    ])
  ])
])

var state = EditorState.create({
  schema,
  doc: INITIAL_DOC,
  plugins: [
    menu(schema),
    history(),
    require('./input-rules'),
    keymap({
      'Mod-z': undo,
      'Mod-y': redo,
      'Mod-b': commands.definition,
      'Mod-i': commands.use,
      'Mod-u': commands.reference,
      'Mod-h': commands.heading,
      'Enter': commands.insertChild,
      'Mod-Enter': commands.insertSibling,
      'Shift-Enter': commands.insertSibling,
      'Backspace': commands.backspace,
      'Mod-Backspace': commands.backspace,
      'Delete': commands.delete,
      'Mod-Delete': commands.delete,
      'Mod-a': commands.selectAll
    }),
    dropCursor(),
    gapCursor(),
    new Plugin({
      state: {
        init: function (_, state) {
          return decorate(state.doc)
        },
        apply: function (tr, old) {
          return decorate(tr.doc)
        }
      },
      props: {
        decorations: function (state) {
          return this.getState(state)
        }
      }
    })
  ]
})

function findEmptyForms (doc) {
  var returned = []
  doc.descendants(function (node, position) {
    if (node.type.name === 'heading') {
      if (nodeIsEmpty(node)) {
        returned.push({
          message: 'Empty Heading',
          from: position + 1,
          to: position + 1 + node.content.size,
          fix: function (editor) {
            var state = editor.state
            var dispatch = editor.dispatch
            dispatch(
              state.tr.setNodeMarkup(
                this.from - 1, null, 'empty'
              )
            )
          }
        })
      }
    } else if (node.type.name === 'form') {
      var empty = true
      for (var index = 0; index < node.childCount; index++) {
        var child = node.child(index)
        if (child.type.name === 'heading') {
          empty = false
          break
        } else if (
          child.type.name === 'paragraph' &&
          nodeIsEmpty(child)
        ) {
          empty = true
          break
        } else if (child.type.name === 'form') {
          empty = false
          break
        }
      }
      if (empty) {
        returned.push({
          message: 'Empty Form',
          from: position + 1,
          to: position + 1 + node.content.size,
          fix: function (editor) {
            var state = editor.state
            var dispatch = editor.dispatch
            dispatch(
              state.tr.setNodeMarkup(
                this.from - 1, null, 'empty'
              )
            )
          }
        })
      }
    }
  })
  return returned
}

function nodeIsEmpty (node) {
  console.log(node)
  console.log('children')
  if (Fragment.empty.eq(node.content)) return true
  if (node.childCount === 0) return true
  for (var index = 0; index < node.childCount; index++) {
    var child = node.child(index)
    console.log(child)
    if (child.isText && child.text.trim().length > 0) return false
  }
  return true
}

function decorate (doc) {
  var decorations = findEmptyForms(doc).map(function (problem) {
    return Decoration.inline(
      problem.from, problem.to, {class: 'problem'}
    )
  })
  return DecorationSet.create(doc, decorations)
}

window.editor = new EditorView(document.body, {state})

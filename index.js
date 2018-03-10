var EditorState = require('prosemirror-state').EditorState
var EditorView = require('prosemirror-view').EditorView
var pmCommands = require('prosemirror-commands')
var dropCursor = require('prosemirror-dropcursor').dropCursor
var gapCursor = require('prosemirror-gapcursor').gapCursor
var history = require('prosemirror-history').history
var keymap = require('prosemirror-keymap').keymap
var redo = require('prosemirror-history').redo
var undo = require('prosemirror-history').undo

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
    gapCursor()
  ]
})

window.editor = new EditorView(document.body, {state})

var EditorState = require('prosemirror-state').EditorState
var EditorView = require('prosemirror-view').EditorView
var Node = require('prosemirror-model').Node
var pmCommands = require('prosemirror-commands')
var dropCursor = require('prosemirror-dropcursor').dropCursor
var gapCursor = require('prosemirror-gapcursor').gapCursor
var history = require('prosemirror-history').history
var keymap = require('prosemirror-keymap').keymap
var redo = require('prosemirror-history').redo
var undo = require('prosemirror-history').undo

var toggleMark = pmCommands.toggleMark
// var inputRules = require('prosemirror-inputrules')

var menu = require('./menu')
var schema = require('./schema')

var commands = require('./commands')

var doc = Node.fromJSON(schema, {
  type: 'form',
  attrs: {conspicuous: false},
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'This is a test.',
          marks: []
        }
      ]
    },
    {
      type: 'form',
      attrs: {conspicuous: false},
      content: [
        {
          type: 'heading',
          content: [
            {
              type: 'text',
              text: 'First Child'
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'First child text.'
            }
          ]
        }
      ]
    },
    {
      type: 'form',
      attrs: {conspicuous: false},
      content: [
        {
          type: 'heading',
          content: [
            {
              type: 'text',
              text: 'Second Child',
              marks: []
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Second child text.',
              marks: []
            }
          ]
        }
      ]
    }
  ]
})

var state = EditorState.create({
  schema,
  doc,
  plugins: [
    menu(schema),
    /*
    inputRules.inputRules({
      rules: [
        new inputRules.InputRule(/[^\x20-\x7E]$/, '')
      ]
      // TODO: Input rule to turn underscores into blanks.
    }),
    */
    history(),
    keymap({
      'Mod-z': undo,
      'Mod-y': redo,
      'Mod-b': commands.definition,
      'Mod-i': commands.use,
      'Mod-u': commands.reference,
      'Enter': commands.insertChild,
      'Mod-Enter': commands.insertSibling,
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

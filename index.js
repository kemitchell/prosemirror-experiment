var EditorState = require('prosemirror-state').EditorState
var EditorView = require('prosemirror-view').EditorView
var Node = require('prosemirror-model').Node
var Schema = require('prosemirror-model').Schema
var commands = require('prosemirror-commands')
var dropCursor = require('prosemirror-dropcursor').dropCursor
var gapCursor = require('prosemirror-gapcursor').gapCursor
var history = require('prosemirror-history').history
var inputRules = require('prosemirror-inputrules')
var keymap = require('prosemirror-keymap').keymap
var redo = require('prosemirror-history').redo
var undo = require('prosemirror-history').undo

var menu = require('./menu')

var NO_MARKS = ''
var ALL_MARKS = '_'

var schema = new Schema({
  nodes: {
    form: {
      content: 'heading? (paragraph | form)+',
      attrs: {conspicuous: {default: false}},
      toDOM: function () {
        return ['section', {class: 'form'}, 0]
      },
      parseDOM: [{tag: 'section.form'}]
    },
    heading: {
      content: 'text+',
      isolating: true,
      marks: NO_MARKS,
      toDOM: function () { return ['header', 0] },
      parseDOM: [{tag: 'header'}]
    },
    paragraph: {
      content: '(text | blank)+',
      isolating: true,
      marks: ALL_MARKS,
      toDOM: function () { return ['p', 0] },
      parseDOM: [{tag: 'p'}]
    },
    blank: {
      inline: true,
      toDOM: function () {
        return ['span', {class: 'blank'}]
      },
      parseDOM: [{tag: 'span.blank'}]
    },
    text: {}
  },
  marks: {
    definition: {
      excludes: ALL_MARKS,
      toDOM: function () { return ['dfn'] },
      parseDOM: [{tag: 'dfn'}]
    },
    use: {
      excludes: ALL_MARKS,
      // inclusive: false,
      toDOM: function () { return ['span', {class: 'use'}] },
      parseDOM: [{tag: 'span.use'}]
    },
    reference: {
      excludes: ALL_MARKS,
      toDOM: function () { return ['span', {class: 'reference'}] },
      parseDOM: [{tag: 'span.reference'}]
    }
  },
  topNode: 'form'
})

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
    inputRules.inputRules({
      rules: [
        new inputRules.InputRule(/[^\x20-\x7E]$/, '')
      ]
      // TODO: Input rule to turn underscores into blanks.
    }),
    history(),
    keymap({
      'Mod-z': undo,
      'Mod-y': redo,
      'Mod-b': commands.toggleMark(schema.marks.definition),
      'Mod-i': commands.toggleMark(schema.marks.use),
      'Mod-u': commands.toggleMark(schema.marks.reference)
    }),
    dropCursor(),
    gapCursor()
  ]
})

window.editor = new EditorView(document.body, {state})

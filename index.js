var EditorState = require('prosemirror-state').EditorState
var EditorView = require('prosemirror-view').EditorView
var Schema = require('prosemirror-model').Schema
var DOMParser = require('prosemirror-model').DOMParser
var schema = require('prosemirror-schema-basic').schema
var addListNodes = require('prosemirror-schema-list').addListNodes
var exampleSetup = require('prosemirror-example-setup').exampleSetup

var mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks
})

var div = document.createElement('div')

var view = window.view = new EditorView(div, {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(document.querySelector('#content')),
    plugins: exampleSetup({schema: mySchema})
  })
})

document.body.appendChild(div)

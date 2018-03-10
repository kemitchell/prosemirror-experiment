var Schema = require('prosemirror-model').Schema

var NO_MARKS = ''
var ALL_MARKS = '_'

module.exports = new Schema({
  nodes: {
    doc: {
      // Note: The root doc cannot contain a heading.
      // TODO: Prevent consecutive paragraphs.
      content: '(paragraph | form)+',
      toDOM: function () {
        return ['article', {class: 'form'}, 0]
      },
      parseDOM: [{tag: 'article'}]
    },
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
      marks: NO_MARKS,
      toDOM: function () { return ['header', 0] },
      parseDOM: [{tag: 'header'}]
    },
    paragraph: {
      content: '(text | blank)+',
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
  }
})

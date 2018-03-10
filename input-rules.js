var inputRules = require('prosemirror-inputrules')

var schema = require('./schema')

module.exports = inputRules.inputRules({
  rules: [
    new inputRules.InputRule(/_{3,}$/, function (state, match, start, end) {
      var $start = state.doc.resolve(start)
      if ($start.parent.type.name !== 'paragraph') return null
      return state.tr.replaceWith(start, end, schema.node('blank'))
    })
  ]
})

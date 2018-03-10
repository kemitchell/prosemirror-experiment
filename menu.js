var menu = require('prosemirror-menu')

var commands = require('./commands')

module.exports = function (schema) {
  return menu.menuBar({
    floating: true,
    content: [
      [
        markToggleMenuItem(commands.definition, 'Definition'),
        markToggleMenuItem(commands.use, 'Use'),
        markToggleMenuItem(commands.reference, 'Reference')
      ],
      [
        new menu.MenuItem({
          title: 'Insert Blank',
          label: 'Blank',
          enable: function (state) {
            return commands.insertBlank
          },
          run: commands.insertBlank
        }),
        new menu.MenuItem({
          title: 'Insert Heading',
          label: 'Heading',
          enable: function (state) {
            return commands.insertHeading
          },
          run: commands.insertHeading
        })
      ],
      [
        menu.undoItem,
        menu.redoItem
      ]
    ]
  })
}

function markToggleMenuItem (command, title) {
  return new menu.MenuItem({
    title: title,
    label: title,
    active: command,
    enable: function (state) {
      return !state.selection.empty
    },
    run: command
  })
}

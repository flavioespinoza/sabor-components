require('./style.less')
var actions = require('./actions')

module.exports = tag('x-swim-toggle', {
  template: require('./template.html'),
  inserted: function () {
    var lastState
    $(this).click(function () {
      var isChecked = $(this).find('input').is(':checked')
      console.log('clicked')
      if (lastState != isChecked) {
        Dispatcher.dispatch(actions.TOGGLE_TOGGLED, {
          checked: isChecked
        })
      }

      lastState = isChecked
    })
  }
})

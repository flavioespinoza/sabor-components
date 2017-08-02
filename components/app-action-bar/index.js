require('./style.less')

var actions = require('./actions.js')
tag('x-app-action-bar', {
  template: require('./template.html'),
  inserted: function () {
    $('button', this).on('click', function (e) {
      var action = $(this).attr('data-action')

      console.log('e', e)

            // swapping between font awesome and material icons
            // ugly but works
      if (action === actions.TOGGLE_CHART_DISPLAY) {
        $('i', this).toggleClass('fa fa-code-fork').text('')

        $('i', this).toggleClass('material-icons')
        if ($('i', this).hasClass('material-icons')) {
          $('i', this).text('bubble_chart')
        }
      }

      Dispatcher.dispatch(actions[action])
    })
  }
})

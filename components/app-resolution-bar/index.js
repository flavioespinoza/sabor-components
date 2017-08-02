require('./style.less')
var actions = require('./actions.js')

tag('x-app-resolution-bar', {
  template: require('./template.html'),
  draw: function () {
    if (Store.get('currentTime')) $('.time', this).text('@ ' + Store.get('currentTime'))
    if (Store.get('currentDate')) $('.date', this).text(Store.get('currentDate'))
  },
  inserted: function () {
    var navs = $('li', this)
    navs.click(function (e) {
      navs.removeClass('selected')
      $(this).addClass('selected')
      Dispatcher.dispatch(actions.SET_RESOLUTION, {
        resolution: $(this).text()
      })
    })
  }
})

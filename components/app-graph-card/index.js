require('./style.less')
require('uicore/mdl-progress-bar')
require('uicore/swim-line-chart')

var odometer = require('odometer')
var moods = require('store/moods')

tag('x-app-graph-card', {
  template: require('./template.html'),
  draw: function () {
    var state = Store.get(this.guid)
    if (state) {
      var instance = this

      if ($(this).hasClass(moods[state.mood]) == false) {
        $(moods).each(function (idx, mood) {
          $(instance).removeClass(mood)
        })
        $(this).addClass(moods[state.mood])
      }

      $('.values .min', this).text(state.min)
      $('.values .max', this).text(state.max)
      $('.values .avg', this).text(state.avg)
      $('x-swim-line-chart', this)[0].load(state.chartData)
      $('x-mdl-progress-bar', this)[0].setProgress(state.deltaPct / 2)
      this.od.update(state.deltaPct)
    }
  },
  inserted: function () {
    this.od = new odometer({
      el: $('.delta .deltapct', this)[0],
      value: 0,

            // Any option (other than auto and selector) can be passed in here
      format: '',
      theme: 'minimal'
    })
  },
  accessors: {
        // X-Tag utomatically maps camelcased accessor setter names to their
        // dashed attribute equivalents. In this example, `limitedCount` maps
        // to the `limited-count` attribute.
    title: {
      attribute: {
        validate: function (val) {},
        default: 'foo'
      },
      get: function () {
                // do something when the getter is accessed
        return this._title
      },
      set: function (value) {
                // act on the value being passed to the setter
        this._title = value
        $('.title', this).text(value)
      }
    }
  }
})

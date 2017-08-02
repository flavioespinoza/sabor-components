require('./style.less')
require('uicore/mdl-progress-bar')
require('uicore/swim-line-chart')

var odometer = require('odometer')
var moods = require('store/moods')

tag('x-app-value-card', {
  template: require('./template.html'),
  draw: function () {
    var state = Store.get(this.guid)
    if (state) {
      var resolution = {
        day: '1d',
        week: '7d'
      }
      resolution = resolution[state.currentResolution]
      $('.resolution', this).text(resolution)

      if ($(this).hasClass('pz-kpi-card') && state.uptime_pz_overview_counts && state.uptime_pz_overview_counts[currentPZ]) {
        var currentPZ = window.app.config.org

        if (state.currentPZ) {
          currentPZ = state.currentPZ
        }

        this.connected = state.uptime_pz_overview_counts[currentPZ].connected
        this.offline = state.uptime_pz_overview_counts[currentPZ].disconnected
      } else if ($(this).hasClass('reader-kpi-card') && state.uptime_reader_overview_counts && state.uptime_reader_overview_counts[currentPZ]) {
                // todo hook up to resolution
        var currentPZ = window.app.config.org

        if (state.currentPZ) {
          currentPZ = state.currentPZ
        }
        this.connected = state.uptime_reader_overview_counts[currentPZ].connected
        this.offline = state.uptime_reader_overview_counts[currentPZ].disconnected
      } else if ($(this).hasClass('downtime') && state.single_pz_down) {
        var currentPZ = window.app.config.org

        if (state.currentPZ) {
          currentPZ = state.currentPZ
        }

        this.connected = state.single_pz_down[currentPZ.substr(1)] ? Math.round(state.single_pz_down[currentPZ.substr(1)][(state.currentResolution || 'week')][1].longest / 60000) : '-'
      }
    }
  },
  inserted: function () {
    this.toggled = false
  },
  methods: {
    toggle: function () {
      this.toggled = !this.toggled
      $(this).toggleClass('opacity-0')
      $('.connected', this).toggleClass('cold-color')
      $('.by-line', this).toggleClass('cold-color')
      $('.sub-title', this).toggleClass('cold-color')
      $('.material-icons.fiber', this).toggleClass('cold-color')
      $('.mdl-progress > .bufferbar', this).toggleClass('cold-bg')
    }
  },
  accessors: {
    byLine: {
      attribute: {},
      get: function () {
        return this._byline
      },
      set: function (value) {
        this._byline = value

        if (value === 'false') {
          $('.by-line', this).hide()
        }
      }
    },
    title: {
      attribute: {},
      get: function () {
        return this._title
      },
      set: function (value) {
        this._title = value
        $('.title', this).text(value)
      }
    },
    subTitle: {
      attribute: {},
      get: function () {
        return this._subtitle
      },
      set: function (value) {
        $('.sub-title', this).text(value)
        this._subtitle = value
      }
    },
    offline: {
      get: function () {
        return this._offline
      },
      set: function (value) {
        $('.offline', this).text(value)
        this._offline = value
      }
    },
    connected: {
      get: function () {
        return this._connected
      },
      set: function (value) {
        $('.stats .connected', this).text(value)
        this._connected = value
      }
    }
  }
})

require('./style.less')
var actions = require('store/actions')

// TODO: Move to global function
// Global helper functions
var formatComma = d3.format(','),
  formatDecimal = d3.format('.1f'),
  formatDecimalComma = d3.format(',.2f'),
  formatSuffix = d3.format('s'),
  formatSuffixDecimal1 = d3.format('.1s'),
  formatSuffixDecimal2 = d3.format('.2s'),
  formatMoney = function (d) {
    return '$' + formatDecimalComma(d)
  },
  formatPercent = d3.format(',.2%')

tag('x-app-donut-chart', {
  template: require('./template.html'),
  draw: function () {
    var node = this.attributes['data-node'].nodeValue
    var lane = this.attributes['data-lane'].nodeValue
    var guid = this.guid
    var state = Store.get(guid)
    if (state) {
            // console.log('state', state);
      var resolution = {
        day: '1d',
        week: '7d'
      }
      resolution = resolution[state.currentResolution]
      $('.resolution', this).text(resolution)

      if (!state.currentPZ && !state.currentReader) {
        this.setData(state.uptime_pz_overview, resolution)
        this.setInfo(state.uptime_pz_overview_counts, resolution)
        this.setData(state.uptime_readers_overview, resolution)
        this.setInfo(state.uptime_reader_overview_counts, resolution)
      } else if (state.currentPZ && !state.currentReader) {
        if (state.single_pz_uptime_percentage) {
          this.setData(state.single_pz_uptime_percentage[state.currentPZ], resolution)
        }
        if (state.single_pz_uptime_percentage_counts) {
          this.setInfo(state.single_pz_uptime_percentage_counts[state.currentPZ], resolution)
        }
        if (state.single_pz_tag_reads) {
          this.setMinMeanMax(state.single_pz_tag_reads, state.currentPZ, resolution)
        }
        if (state.single_pz_down) {
          this.setDownTime(state.single_pz_down, state.currentPZ, 'state.single_pz_down', resolution)
        }
      } else if (!state.currentPZ && state.currentReader) {
        if (state.single_reader_uptime_percentage) {
          this.setData(state.single_reader_uptime_percentage['/reader/' + state.currentReader], resolution)
          this.setDownTime(state.single_reader_downtime_stats, '/reader/' + state.currentReader, resolution)
        }
        if (state.single_reader_tag_reads) {
          this.setMinMeanMax(state.single_reader_tag_reads, '/reader/' + state.currentReader, resolution)
        }
      }
    }
  },
  inserted: function () {
    var _self = this
    var lane = this.attributes['data-lane'].nodeValue
    var title = this.attributes['data-title'].nodeValue
    $('.donut-title', _self).html(title)
    var donutSubTitle = this.attributes['data-donut-sub-title'].nodeValue
    $('.donut-sub-title', _self).html(donutSubTitle)
    var subtitle
    if (_self.attributes['data-subchart']) {
      $('.donut-sub-chart', _self).removeClass('hidden')
      subtitle = _self.attributes['data-subtitle'].nodeValue
      $('.donut-subchart-title', _self).html(subtitle)
    }
    var dataset = {
      value: [0, 100]
    }
    var width = $('.chart', _self).width()
    var height = $('.chart', _self).height()

    _self._radius = Math.min(width, height) / 2
    _self._color = d3.scale.ordinal().range(['#709ed4', '#d4d4d4'])
    _self._pie = d3.layout.pie().sort(null)
    _self._arc = d3.svg.arc()
            .innerRadius(_self._radius - 24)
            .outerRadius(_self._radius - 6)

    _self._svg = d3.select(_self)
            .select('.chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

    _self._path = _self._svg.selectAll('path')
            .data(_self._pie(dataset.value))
            .enter()
            .append('path')
            .attr('fill', function (d, i) {
              return _self._color(i)
            })
            .attr('d', _self._arc)

    _self._text = d3.select(this)
            .select('svg')
            .data(dataset.value)
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('y', (height / 2) + 8)
            .attr('x', width / 2)
            .style('stroke', '#709ed4')
            .style('font-family', 'Lato')
            .style('font-size', '24px')
            .style('font-weight', '300')
            .text(function (d) {
              return d
            })
  },
  methods: {
    setDownTime: function (state, id, note) {
      if (!state || !state[id]) {
        return
      }
      var _self = this
      var week = {}
      _.each(state[id].week, function (obj) {
        _.map(obj, function (val, key) {
          week[key] = val
        })
      })

      function duration (ms) {
        var days = ms._data.days + 'd '
        var hours = ms._data.hours + 'h '
        var minutes = ms._data.minutes + 'm '
        var seconds = ms._data.seconds + 's'
        var duration
        if (ms._data.days > 0) {
          duration = days + hours + minutes + seconds
        } else if (ms._data.days <= 0 && ms._data.hours > 0) {
          duration = hours + minutes + seconds
        } else if (ms._data.days <= 0 && ms._data.hours <= 0 && ms._data.minutes > 0) {
          duration = minutes + seconds
        } else if (ms._data.days <= 0 && ms._data.hours <= 0 && ms._data.minutes <= 0) {
          duration = seconds
        }
        return duration
      }

      var longest = duration(moment.duration(week.longest))
      var shortest = duration(moment.duration(week.shortest))

      $('.longest .fr', _self)
                .html(longest)
      $('.occurrences .fr', _self)
                .html(week.occurrences)
      $('.shortest .fr', _self)
                .html(shortest)
      $('.total .fr', _self)
                .html(week.unique)
      $('.sub-chart-list', _self)
                .removeClass('hidden')
    },
    setMinMeanMax: function (state, id) {
      var _self = this
      var week = {}
      var day = {}

      if (!state || !state[id]) {
        return
      }

      _.each(state[id].week, function (obj) {
        _.map(obj, function (val, key) {
          week[key] = val
        })
      })
      _.each(state[id].day, function (obj) {
        _.map(obj, function (val, key) {
          day[key] = val
        })
      })

      var resolution = week

      $('.min .fr', _self)
                .html(resolution.min)
      $('.max .fr', _self)
                .html(resolution.max)
      $('.avg .fr', _self)
                .html(resolution.avg)
      $('.avg-total .fr', _self)
                .html(resolution.total)
      $('.info', _self)
                .addClass('hidden')
      $('.sub-chart-avg', _self)
                .removeClass('hidden')
      $('.chart', _self)
                .addClass('center-chart')
      $('.donut-sub-title', _self)
                .addClass('center-donut-sub-title')

      var limit = (resolution.total / resolution.limit) * 100 || 0

      var dataset = {
        value: [limit, 100 - limit]
      }

      _self._path = _self._path.data(_self._pie(dataset.value))
      _self._path.attr('d', _self._arc)
      _self._text.text(formatSuffixDecimal2(resolution.total))
    },
    setData: function (state, resolution) {
      var _self = this
      if (!state) {
        return
      }

      var dataset = {
        value: [state.week, 100 - state.week]
      }
      _self._path = _self._path.data(_self._pie(dataset.value)) // compute the new angles
      _self._path.attr('d', _self._arc) // redraw the arcs
      _self._text.text(dataset.value[0] + '%')
    },
    setInfo: function (state, resolution) {
      if (!state) {
        return
      }
      var _self = this

      var __resolutions = {
        day: '1d',
        week: '7d'
      }

            // console.log('resolution', resolution)
      if (!resolution) {
        resolution = _.findKey(__resolutions, function (item) {
          return item.indexOf('7d') !== -1
        })
      }

      var primaryBackup = {
        primary: 0,
        backup: 0
      }

      Swim.downlink()
                .host(window.app.config.endPoints.host)
                .node(window.app.config.org)
                .lane('pzPrimaryCounts')
                .onEvent(function (msg) {
                  primaryBackup.primary = msg.body.primary
                  primaryBackup.backup = msg.body.backup

                  $('#info_key_primary', _self).html('Primary')
                  $('#info_value_primary', _self).html(primaryBackup.primary)
                  $('#info_key_backup', _self).html('Backup')
                  $('#info_value_backup', _self).html(primaryBackup.backup)
                })
                .sync()

      if ('connected' in state) {
        $('.info-key-1', _self).html('Connected')
        $('.info-key-2', _self).html('Disconnected')
        $('.info-value-1', _self).html(state.connected)
        $('.info-value-2', _self).html(state.disconnected)
      } else if ('offline' in state) {
        $('.info-key-1', _self).html('Online')
        $('.info-key-2', _self).html('Offline')
        $('.info-value-1', _self).html(state.online)
        $('.info-value-2', _self).html(state.offline)
      }
    }
  }

})

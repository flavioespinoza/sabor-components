require('./style.less')
var actions = require('store/actions')
tag('x-app-step-chart', {
  template: require('./template.html'),
  draw: function() {
    var _self = this
    var state = Store.get(_self.guid)
    if (state) {
      //TODO - Flavio: Add D3 smooth transition update function
      var arr = state.step_chart_data.data.slice(Math.max(state.step_chart_data.data.length - 11, 1))
      _self.drawChart(arr, 'chart_7d', 35)
    }
  },
  inserted: function() {
    /** STEPCHART */
    var _self = this
    var title = _self.attributes['data-title'].nodeValue
    $('.step-title', _self).html(title)
  },
  methods: {
    drawChart: function(data, __chart_id, __threshold) {
      if (!data) {
        console.log('No Data Received', data);
        return
      }
      var _self = this
      _self.date_formatted = 'M/D @ h:mm a'
      /** CHART DIMENSIONS */
      var margin = {
        top: 20,
        right: 40,
        bottom: 50,
        left: 40
      }
      //TODO: Remove when update chart function is done
      /** Removes existing svg from DOM */
      if (_self._svg) {
        d3.select('#' + __chart_id + '_svg_' + _self.guid).remove()
      }
      _self._width = _self.clientWidth - margin.left - margin.right
      _self._height = _self.clientHeight - margin.top - margin.bottom
      /** SVG */
      _self._svg = d3.select(_self).select('#' + __chart_id).append('svg').attr('id', __chart_id + '_svg_' + _self.guid).attr('width', _self._width + margin.left + margin.right).attr('height', _self._height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      /** Removes existing tooltip from DOM */
      if (_self.div) {
        $('#' + __chart_id + '_tooltip_' + _self.guid).remove()
      }
      /** TOOLTIP */
      _self.div = d3.select(_self).select('.chart-wrapper').append('div').attr('id', __chart_id + '_tooltip_' + _self.guid).attr('class', 'step-chart-tooltip pl12 pt8 pb6').style('display', 'none')
      /** DATA FAIL CATCH */
      if (data.length < 2) {
        console.log('__data failed', data)
        return
      }
      var max = d3.max(data, function(d) {
        return d.points
      })
      var bisectDate = d3.bisector(function(d) {
        return d.start_date
      }).left
      var x = d3.time.scale().range([0, _self._width]).domain([d3.min(data, function(d) {
        return d.start_date
      }), d3.max(data, function(d) {
        return d.end_date
      })])
      var y = d3.scale.linear().range([_self._height, 0])
      var xAxis = d3.svg.axis().scale(x).orient('bottom').tickSize(-_self._height, 0, 0).ticks(6).tickFormat(function(d) {
        return moment(d).format(_self.date_formatted)
      })
      var yAxis = d3.svg.axis().scale(y).orient('left').ticks(2).tickSize(-_self._width, 0, 0).tickFormat(function(d) {
        return d
      })
      y.domain([0, max])
      var line = 'M'
      var fill = 'M0,' + _self._height
      /** DATA */
      data.forEach(function(d, i) {
        d.index = i
        var y0 = y(d.points)
        var x0 = x(d.end_date)
        if (i === 0) {
          line += x(d.start_date) + ',' + y0 + 'H' + x0
        } else {
          line += 'H' + x0
        }
        fill += 'V' + y0 + 'H' + x0
        if (data[i + 1]) {
          line += 'V' + y(data[i + 1].points)
        }
      })
      fill += 'V' + _self._height + 'Z'
      /** RENDER THE CHART */
      _self._svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + _self._height + ')').call(xAxis)
      _self._svg.append('g').attr('class', 'y axis').call(yAxis).append('text').attr('transform', 'rotate(-90)').attr('y', 6).attr('dy', '.71em').style('text-anchor', 'end').text('Readers')
      _self._svg.append('path').attr('class', 'line').attr('d', line).style('stroke', '##5a9ae3')
      _self._svg.append('path').attr('class', 'path-fill').attr('d', fill).style('fill', '#F0F5FA')
      /** FOCUS FUNCTIONS FOR TOOLTIP */
      var focus = _self._svg.append('g').attr('class', 'tooltip').style('display', 'none').style('fill', 'red')
      focus.append('circle').attr('class', 'tooltip-point').attr('r', 6)
      focus.append('text').attr('class', 'y1').attr('dx', '-2em').attr('dy', '-.75em')
      focus.append('line').attr('class', 'tooltip-line tooltip-start-date').attr('y1', _self._height).attr('y2', _self._height)
      focus.append('line').attr('class', 'tooltip-line tooltip-end-date').attr('y1', _self._height).attr('y2', _self._height)
      focus.append('line').attr('class', 'tooltip-line tooltip-mileage').attr('x1', 0).attr('x2', _self._width).attr('y1', _self._height).attr('y2', _self._height)
      focus.append('text').attr('class', 'x1').attr('dx', '-4.5em').attr('dy', '-.5em').attr('transform', 'rotate(90)')
      focus.append('text').attr('class', 'x2').attr('dx', '-4.5em').attr('dy', '-.5em')
      /** INVISIBLE RECT FOR MOUSEOVER EVENTS */
      _self._svg.append('rect').attr('width', _self._width).attr('height', _self._height).style('fill', 'none').style('pointer-events', 'all').on('mouseover', function() {
        /** CALL TOOLTIP */
        _self.div.style('display', 'inline')
        return focus.style('display', null)
      }).on('mouseout', function() {
        _self.div.style('display', 'none')
        return focus.style('display', 'none')
      }).on('mousemove', mousemove)
      var template = _.template(require('./tooltip.html'))
      /** MOUSEOVER FUNCTION */
      function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0])
        var i = bisectDate(data, x0, 1)
        var d = data[i - 1]
        focus.select('circle.tooltip-point').attr('transform', 'translate(' + d3.mouse(this)[0] + ',' + y(d.points) + ')')
        _self.div.style('left', (d3.mouse(this)[0] + 42) + 'px').style('top', (y(d.points) + 'px'))
        /** TOOLTIP DATA */
        var tooltipInner = {}
        tooltipInner.title = 'Devices\'s Reporting: ' + d.points
        tooltipInner.devices = d.points
        tooltipInner.start_date = d.start_date
        tooltipInner.end_date = d.end_date
        tooltipInner.start_date_formatted = d.start_date_formatted
        tooltipInner.end_date_formatted = d.end_date_formatted
        /** SET WARNING THRESHOLD */
        if (d.points <= __threshold) {
          $('.step-chart-tooltip', _self).addClass('tooltip-warning')
        } else {
          $('.step-chart-tooltip', _self).removeClass('tooltip-warning')
        }
        /** TOOLTIP COOLNESS - VERTICLE LINES BETWEEN DATES */
        $('.step-chart-tooltip').html(template(tooltipInner))
        focus.select('text.y1').attr('transform', 'translate(' + d3.mouse(this)[0] + ',' + y(d.points) + ')')
        focus.select('text.x1').attr('transform', 'translate(' + x(d.start_date) + ',' + (_self._height + y(d.points)) / 2 + ') rotate(-90)')
        focus.select('text.x2').attr('transform', 'translate(' + x(d.end_date) + ',' + (_self._height + y(d.points)) / 2 + ') rotate(-90)')
        focus.select('line.tooltip-start-date').attr('y2', y(d.points)).attr('x1', x(d.start_date)).attr('x2', x(d.start_date))
        focus.select('line.tooltip-end-date').attr('y2', y(d.points)).attr('x1', x(d.end_date)).attr('x2', x(d.end_date))
        focus.select('line.tooltip-mileage').attr('y1', y(d.points)).attr('y2', y(d.points))
        focus.select('text.x1').text(d.start_date_formatted)
        focus.select('text.x2').text(d.start_date_formatted)
      }
    }
  }
})
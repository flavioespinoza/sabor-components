/**
 * Created by Flavor on 5/16/17.
 */

require('./style.less')
var Chance = require('chance'),
  chance = new Chance()

tag('x-swim-events-chart', {
  template: require('./template.html'),
  inserted: function () {
        // TODO: Remove when for Sensornet delivery
    return

    var _self = this
    var dataXAxis = _self.attributes['data-x-axis'].nodeValue

    _self._host = Swim.downlink().host(window.app.config.endPoints.host)

    var title = $(_self).attr('data-chart-title')
    $('.chart-events-title', _self).html(title)

    var margin = {
      top: 20,
      right: 48,
      bottom: 40,
      left: 48
    }
    var width = 1284 - margin.left - margin.right

        // width = $('.chart-events', _self).width() - margin.left - margin.right,
        // height = $('.chart-events', _self).height() - margin.top - margin.bottom;

    var height = 76 - margin.top - margin.bottom

        // setup x
    var xValue = function (d) {
        return d.timeFormatted
      }, // data -> value
      xScale = d3.scale.linear().range([0, width]), // value -> display
      xMap = function (d) {
        return xScale(xValue(d))
      }, // data -> display
      xAxis = d3.svg.axis().scale(xScale).orient('bottom')

        // setup y
    var yValue = function (d) {
        return d.level
      }, // data -> value
      yScale = d3.scale.linear().range([height, 0]), // value -> display
      yMap = function (d) {
        return yScale(yValue(d))
      }, // data -> display
      yAxis = d3.svg.axis().scale(yScale).orient('left')

        // setup fill color
    var cValue = function (d) {
        return d.level
      },
      color = d3.scale.category10()

        // add the graph canvas to the body of the webpage
    _self._svg = d3.select(_self).select('.chart-events').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        // add the tooltip area to the webpage
    var tooltip = d3.select(_self).append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)

        // load data
        // change string (from CSV) into number format

        // var data = _self.getData();

    var data = []

        // console.log(title + ' Data: ', JSON.stringify(data));

    $('.jobs-info', _self).removeClass('hidden')

    var resolution = 'week'

    _self._host
            .node('/sensornet/SensorNet')
            .lane('jobStatusEventCounts/' + resolution)
            .onEvent(function (msg) {
              data.push({
                level: 1,
                category: title,
                timestamp: msg.body['@update'].key
              })
            })
            .sync()

    setTimeout(function () {
            // TODO: Added randomized data for QA: Remove once QA is done.
      for (var i = 0; i < data.length; i++) {
        data[i].timeFormatted = i
        data[i].value = chance.integer({
          max: 12,
          min: 1
        })
      }

      var dMin = _.minBy(data, function (obj) {
        return obj.value
      })

      var dMax = _.maxBy(data, function (obj) {
        return obj.value
      })

      var rs = d3.scale.linear()
                .domain([dMin.value, dMax.value])
                .range([2, 12])

            // don't want dots overlapping axis, so add in buffer to data domain
      xScale.domain([d3.min(data, xValue) - 1, d3.max(data, xValue) + 1])
      yScale.domain([d3.min(data, yValue) - 1, d3.max(data, yValue) + 1])

            // x-axis
      if (dataXAxis === 'true') {
        _self._svg.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(0,' + height + ')')
                    .style('text-size', '11px')
                    .call(xAxis.ticks(5))

        _self._svg.select('.x.axis')
                    .selectAll('text')
                    .style('font-size', '8px')
      }

            // y-axis
            // svg.append('g')
            //     .attr('class', 'y axis')
            //     .call(yAxis)

            // draw dots
      _self._svg.selectAll('.dot')
                .data(data)
                .enter().append('circle')
                .attr('class', 'dot')
                .attr('r', function (d) {
                  return rs(d.value)
                })
                .attr('cx', xMap)
                .attr('cy', yMap)
                .style('fill', '#709ED4')
                .style('opacity', 0.25)
                .on('mouseover', function (d) {
                  tooltip.transition()
                        .duration(200)
                        .style('opacity', 0.9)
                  tooltip.html('Events' + ' (' + d.value + ') ' + moment(d.timestamp).format('h:mm:ss a'))
                        .style('left', (d3.event.pageX - 100) + 'px')
                        .style('top', (d3.event.pageY - 100) + 'px')
                })
                .on('mouseout', function (d) {
                  tooltip.transition()
                        .duration(500)
                        .style('opacity', 0)
                })
    }, 2000)
  },
  methods: {}

})

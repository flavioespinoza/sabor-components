require('./style.less')

tag('x-app-bubble-chart', {
  template: require('./template.html'),
  draw: function () {

  },
  inserted: function () {
    var _self = this

    _self.json = _self.getData()

    var rs = d3.scale.linear()
            .domain([0.01, 5000])
            .range([10, 300])

    var chart = c3.generate({
      bindto: document.querySelector('#bubbleChart'),
      size: {
        height: 740
      },
      padding: {
        right: 48,
        left: 0
      },
      data: {
        json: _self.json,
        keys: {
          x: 'date',
          value: ['level']
        },
        type: 'scatter',
        onmouseover: function (d) {
          d3.select(d3.selectAll('g.c3-circles-level circle')[0][d.index]).style('fill', '#ffc107')
        },
        onmouseout: function (d) {
          d3.select(d3.selectAll('g.c3-circles-level circle')[0][d.index]).style('fill', '#cdcdcd')
        }
      },
      point: {
        r: function (d) {
          return rs(_self.json[d.index].total)
        },
        sensitivity: 40,
        focus: {
          expand: {
            enabled: false
          }
        }
      },
      tooltip: {
        contents: function (d) {
                    // TODO: Switch with swim service
          var tooltipData = [
                        ['ASN', 1036],
                        ['CRATE', 101],
                        ['CART', 204],
                        ['DREW BOX', 400]
          ]
          _self.generateTooltip(this.tooltip, tooltipData, d, _self.json)
        }
      },
      legend: {
        hide: 'level'
      },
      axis: {
        x: {
          label: 'day',
          type: 'category',
          tick: {
            format: function (d) {
              return moment(_self.json[d].date).format('ddd, MMM DD YYYY @ hh:mm:ss A')
            }
          },
          padding: {
            left: 0.5
          }
        },
        y: {
          label: 'location',
          show: false,
          padding: {
            top: 100,
            bottom: 100
          }
        }
      },
      grid: {
        y: {
          lines: [
                        // TODO: Auto generate from swim service
            {
              value: 0,
              text: 'LOC  Alpha Centari',
              position: 'start'
            },
            {
              value: 1,
              text: 'LOC 1',
              position: 'start'
            },
            {
              value: 2,
              text: 'LOC 2',
              position: 'start'
            }
          ]
        }
      }
    })

        /** Generate custom tooltip html */
    chart.internal.tooltip.html = function () {
      $(this[0]).addClass('swim-tooltip mdl-card mdl-shadow--2dp p12')
      return chart.internal.tooltip
    }

        /** Generate text labels for circles */
    var circles = d3.selectAll('g.c3-circles-level circle')
    circles.style('opacity', 1)
    circles.style('fill', '#cdcdcd')

    var __circles = circles[0]

    for (var i = 0; i < __circles.length; i++) {
      var parent = d3.select(__circles[i].parentNode)
      var cy = __circles[i].attributes.cy.nodeValue
      var y = _.toNumber(cy) + 7
      var cx = __circles[i].attributes.cx.nodeValue
      var text
      if (_self.json[i]) {
        text = _self.json[i].total
      } else {
        console.log('i', i)
      }

      parent.append('text')
                .attr('text-anchor', 'middle')
                .attr('y', y)
                .attr('x', cx)
                .attr('font-size', '20px')
                .text(_.round(text, 0))
    }

    var yGridLines = d3.select('g.c3-grid.c3-grid-lines')
    yGridLines.each(function () {
      this.parentNode.insertBefore(this, this.parentNode.firstChild)
    })
  },
  methods: {
    generateTooltip: function (tooltip, tooltipData, d, json) {
            /** Remove the existing chart */
      if (tooltip.chart) {
        tooltip.chart = tooltip.chart.destroy()
        tooltip.selectAll('*').remove()
      }

      var location = json[d[0].index].name
      var total = json[d[0].index].total
      var date = moment(json[d[0].index].date).format('@ hh:mm:ss A')

      $(tooltip[0]).append('<div class="title mb4">' + location + '</div>')
      $(tooltip[0]).append('<div class="total mb4">(' + total + ')</div>')
      $(tooltip[0]).append('<div class="time mb4">' + date + '</div>')

      var colorPattern = ['#ffc107', '#FED45B', '#FD9F28', '#FFEBB6']

            /** Create new chart */
      tooltip.chart = c3.generate({
        bindto: tooltip,
        padding: {
          top: 0,
          bottom: 0,
          right: 0,
          left: 0
        },
        size: {
          width: 242,
          height: 220
        },
        data: {
          columns: tooltipData,
          type: 'pie'
        },
        color: {
          pattern: colorPattern
        },
        tooltip: {
          show: false
        },
        legend: {
          show: false
        }
      })

      for (var i = 0; i < tooltipData.length; i++) {
        $(tooltip[0]).append('<div class="legend-title mb4"><div class="fa fa-circle" style="background-color: ' + colorPattern[i] + '"></div>' + tooltipData[i][0] + '</div>')
        $(tooltip[0]).append('<div class="legend-total mb4">' + tooltipData[i][1] + '</div>')
      }

      tooltip.style('position', 'absolute')
      tooltip.style('max-height', '482px')
      tooltip.style('max-width', '242px')
      tooltip.style('background-color', 'white')
    },
    getData: function () {
            // TODO: Switch with Swim service
      return [{
        date: '2017-01-01',
        level: 0,
        name: 'LOC Alpha Centari',
        total: 100
      }, {
        date: '2017-01-01',
        level: 1,
        name: 'LOC 1',
        total: 101
      }, {
        date: '2017-01-01',
        level: 2,
        name: 'LOC 2',
        total: 102
      }, {
        date: '2017-01-02',
        level: 0,
        name: 'LOC Alpha Centari',
        total: 200
      }, {
        date: '2017-01-02',
        level: 1,
        name: 'LOC 1',
        total: 201
      }, {
        date: '2017-01-02',
        level: 2,
        name: 'LOC 2',
        total: 202
      },
      {
        date: '2017-01-03',
        level: 0,
        name: 'LOC Alpha Centari',
        total: 300
      }, {
        date: '2017-01-03',
        level: 1,
        name: 'LOC 1',
        total: 301
      }, {
        date: '2017-01-03',
        level: 2,
        name: 'LOC 2',
        total: 302
      },
      {
        date: '2017-01-04',
        level: 0,
        name: 'LOC Alpha Centari',
        total: 400
      }, {
        date: '2017-01-04',
        level: 1,
        name: 'LOC 1',
        total: 401
      }, {
        date: '2017-01-04',
        level: 2,
        name: 'LOC 2',
        total: 402
      },
      {
        date: '2017-01-05',
        level: 0,
        name: 'LOC Alpha Centari',
        total: 500
      },
      {
        date: '2017-01-05',
        level: 1,
        name: 'LOC 1',
        total: 501
      },
      {
        date: '2017-01-05',
        level: 2,
        name: 'LOC 2',
        total: 502
      },
      {
        date: '2017-01-06',
        level: 0,
        name: 'LOC Alpha Centari',
        total: 600
      }, {
        date: '2017-01-06',
        level: 1,
        name: 'LOC 1',
        total: 601
      }, {
        date: '2017-01-06',
        level: 2,
        name: 'LOC 2',
        total: 602
      },
      {
        date: '2017-01-07',
        level: 0,
        name: 'LOC Alpha Centari',
        total: 700
      }, {
        date: '2017-01-07',
        level: 1,
        name: 'LOC 1',
        total: 701
      }, {
        date: '2017-01-07',
        level: 2,
        name: 'LOC 2',
        total: 702
      }
      ]
    }
  }
})

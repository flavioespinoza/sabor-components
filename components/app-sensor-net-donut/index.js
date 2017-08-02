/**
 * Created by Flavor on 5/16/17.
 */

require('./style.less')
var appResolutionBarActions = require('components/app-resolution-bar/actions')

tag('x-app-sensor-net-donut', {
  template: require('./template.html'),
  inserted: function () {
    var _self = this

        /** Set Host and Lane */
    _self._host = Swim.downlink().host(window.app.config.endPoints.host)

        // TODO: Remove this when everything is working properly on _self._host.
    _self._host_1 = Swim.downlink().host(window.app.config.endPoints.host)

    var lane = $(_self).attr('data-lane')

        /** Generate Chart */
    var dataset = {
      value: [0, 100]
    }

    var width = $('.chart', _self).width()
    var height = $('.chart', _self).height()

    _self._radius = Math.min(width, height) / 2

    _self._color = d3.scale.category20()

    _self._pie = d3.layout.pie()
            .sort(null)

    _self._arc = d3.svg.arc()
            .innerRadius(_self._radius - 12)
            .outerRadius(_self._radius - 32)

    _self._svg = d3.select(_self).select('.chart').append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

    _self._path = _self._svg.selectAll('path')
            .data(_self._pie(dataset.value))
            .enter().append('path')
            .attr('fill', '#709ED4')
            .attr('d', _self._arc)

    _self._text = d3.select(_self).select('svg')
            .data(dataset.value)
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('y', (height / 2) + 8)
            .attr('x', width / 2)
            .style('font-size', '32px')
            .text(function (d) {
              return d
            })

        /** Set data per lane */
    if (lane === 'eventLogStatusCounts') {
      _self.setResolutionLogs('week')

      Dispatcher.subscribe(function (action, data) {
        switch (action) {
          case appResolutionBarActions.SET_RESOLUTION:

            var resolution = $(data).attr('data-resolution')

            if (resolution == 1) {
              _self.setResolutionLogs('day')
            } else {
              _self.setResolutionLogs('week')
            }

            break
        }
      })
    } else if (lane === 'eventNotificationStatusCounts') {
      _self.setResolutionEventNotifications('week')

      Dispatcher.subscribe(function (action, data) {
        switch (action) {
          case appResolutionBarActions.SET_RESOLUTION:

            var resolution = $(data).attr('data-resolution')

            if (resolution == 1) {
              _self.setResolutionEventNotifications('day')
            } else {
              _self.setResolutionEventNotifications('week')
            }

            break
        }
      })
    } else if (lane === 'jobStatusEventCounts') {
      _self.setResolutionJobStatusEvents('day')
    }
  },
  methods: {
    setResolutionLogs: function (resolution) {
      var _self = this

      $('.log-events-info', _self).removeClass('hidden')

            // TODO: Change to _self._host when everything is working properly on _self._host.
      _self._host_1
                .node('/sensornet/SensorNet')
                .lane('eventLogStatusCounts/' + resolution)
                .onEvent(function (msg) {
                    // console.log('_______eventLogStatusCounts/' + resolution, msg.body);
                  var dataset = {
                    value: [msg.body.processed, msg.body.failed]
                  }
                  _self.setData(dataset)
                  $('#logEvents', _self).html(msg.body.processed)
                  $('#logEventsProcessed', _self).html(msg.body.processed)
                  $('#logEventsFailed', _self).html(msg.body.failed)
                })
                .sync()

      $('#logEventsDownloadLog', _self).on('click', function (e) {
        window.open('http://sensornet.swim.services/sensornet/SensorNet?lane=eventLogs/' + resolution + '&token=abcd')
      })
    },
    setResolutionEventNotifications: function (resolution) {
      var _self = this

      $('.event-notification-info', _self).removeClass('hidden')

            // TODO: Change to _self._host when everything is working properly on _self._host.
      _self._host_1
                .node('/sensornet/SensorNet')
                .lane('eventNotificationStatusCounts/' + resolution)
                .onEvent(function (msg) {
                  var dataset = {
                    value: [msg.body.delivered, msg.body.failed]
                  }
                  _self.setData(dataset)
                  $('#eventsToBeDelivered', _self).html(msg.body.toBeDelivered)
                  $('#eventsDelivered', _self).html(msg.body.delivered)
                  $('#eventsFailed', _self).html(msg.body.failed)
                })
                .sync()

      $('#eventsDownloadLog', _self).on('click', function (e) {
        window.open('http://sensornet.swim.services/sensornet/SensorNet?lane=eventNotifications/' + resolution + '&token=abcd')
      })
    },

    setResolutionJobStatusEvents: function (resolution) {
      var _self = this

      $('.jobs-info', _self).removeClass('hidden')

      var eventBubble = []

      _self._host
                .node('/sensornet/SensorNet')
                .lane('jobStatusEventCounts/' + resolution)
                .onEvent(function (msg) {
                    // console.log('msg.body', msg.body);
                  var dataset = {
                    value: [msg.body.total, msg.body.failed]
                  }
                  _self.setData(dataset)
                  $('#jobsRunning', _self).html(msg.body.running)
                  $('#jobsScheduled', _self).html(msg.body.scheduled)
                  $('#jobsStopped', _self).html(msg.body.stopped)
                  $('#jobsFailed', _self).html(msg.body.failed)

                  eventBubble.push({
                    timestamp: msg.body['@update'].key,
                    value: msg.body.total
                  })
                })
                .sync()

      $('#jobsDownloadLog', _self).on('click', function (e) {
        window.open('http://sensornet.swim.services/sensornet/SensorNet?lane=jobStatusEvents/' + resolution + '&token=abcd')
      })
    },

    setData: function (dataset) {
      var _self = this
      $('.donut-title', _self).html($(_self).attr('data-title'))

      _self._path = _self._path.data(_self._pie(dataset.value)) // compute the new angles
      _self._path.attr('d', _self._arc) // redraw the arcs
      _self._text.text(dataset.value[0]) // update text
    }
  }
})

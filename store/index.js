var actions = require('./actions')
var endPoints = window.app.config.endPoints
var chance = require('chance').Chance()

function setState(state_name, data, id) {
  var state = Store.get(data.meta.guid) || {}
  var new_state_name = state[state_name] || {}
  if (data.meta.type === 'websocket') {
    new_state_name[data.node.replace(endPoints.host, '')] = data
    state[state_name] = new_state_name
  } else {
    state[state_name] = {
      data: data.data,
      update: data.meta.update
    }

  }
  Store.put(data.meta.guid, state)
}
var store = {
  timers: {
    currentTime: Store.timer(function() {
      return {
        // return the object we want
        // merged into the static store
        currentTime: moment().format('h:mm:ss A'),
        currentDate: moment().format('MMMM DD, YYYY')
      }
    }, 1000)
  },
  dispatched: function(action, data) {
    var data_array = []
    var date_formatted = 'M/D @ h:mm a'
    switch (action) {
      case actions.GET_STEP_CHART_DATA:
        if (!data.charts) {
          return
        }
        var guid = data.charts[0].guid
        var obj = {}

        /** call data */
        require(['./data-models/data-model-step-chart.json'], function(step_chart_data) {
          for (var i = 0; i < step_chart_data.length; i++) {
            obj = {
              start_date: moment(step_chart_data[i].start_date)._d,
              end_date: moment(step_chart_data[i].end_date)._d,
              start_date_formatted: moment(step_chart_data[i].start_date).format(date_formatted),
              end_date_formatted: moment(step_chart_data[i].end_date).format(date_formatted),
              points: chance.integer({
                max: 100,
                min: 0
              }),
              list: []
            }
            data_array.push(obj)
          }
          obj = {
            meta: {
              guid: guid,
              type: 'json',
              update: 0
            },
            data: data_array
          }
          /** set state */
          setState('step_chart_data', obj, 'data_model')

          /** simulate streaming data */
          Store.timer(function () {
            var start_date_new = obj.data[obj.data.length - 1].end_date
            var end_date_new = moment(obj.data[obj.data.length - 1].end_date).add(1, 'day')._d
            var points_new = chance.integer({
              max: 100,
              min: 0
            })
            data_array.push({
              start_date: start_date_new,
              end_date: end_date_new,
              start_date_formatted: moment(start_date_new).format(date_formatted),
              end_date_formatted: moment(end_date_new).format(date_formatted),
              points: points_new,
              list: []
            })
            obj.data = data_array
            obj.meta.update++

            /** update states */
            setState('step_chart_data', obj, 'data_model')
          }, 5000)
        })
        break
    }
  }
}
/** setup dispatcher */
Dispatcher.subscribe(store.dispatched)
module.exports = store
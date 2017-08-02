var actions = require('./actions')
var resolutionBarActions = require('components/app-resolution-bar/actions')
var currentPZ
var currentReader
var currentResolution
var endPoints = window.app.config.endPoints

function setState (state_name, data, id) {
  var state = Store.get(data.meta.guid) || {}
  var new_state_name = state[state_name] || {}
  new_state_name[data.node.replace(endPoints.host, '')] = data
  if (id === 'pz') {
    state.currentPZ = currentPZ
    data.meta.pz_id = currentPZ
  } else {
    state.currentReader = currentReader
    data.meta.reader_id = currentReader
  }
  state[state_name] = new_state_name
  Store.put(data.meta.guid, state)
}

var store = {
  timers: {
    currentTime: Store.timer(function () {
      return {
        // return the object we want
        // merged into the static store
        currentTime: moment().format('h:mm:ss A'),
        currentDate: moment().format('MMMM DD, YYYY')
      }
    }, 1000)
  },
  dispatched: function (action, data) {
    switch (action) {
      case resolutionBarActions.SET_RESOLUTION:

        var resolutions = {
          '7d': 'week',
          '1d': 'day'
        }
        currentResolution = resolutions[data.resolution.trim()]
        // set the resolution for these ui components
        // todo: move these to a view with a dispatch listener
        $('x-app-value-card, x-app-donut-chart, x-app-step-chart, x-swim-left-nav').each(function (index, element) {
          Store.put(element.guid, {
            currentResolution: currentResolution
          })
        })

        break
      case actions.SET_PZ_ID:
        currentPZ = data
        Store.put('currentPZ', {
          value: currentPZ
        })
        break
      case actions.SET_READER_ID:
        currentReader = data
        Store.put('currentReader', {
          value: currentReader
        })
        break

      case actions.GET_UPTIME_PZ_OVERVIEW:
        var pzOverview = require('./middleware/pz_overview')
        pzOverview.apply(this, arguments)
        break

      /** ORG OVERVIEW -=====================-=====================-===================== */
      case actions.SET_UPTIME_PZ_OVERVIEW:
        if (data.meta) {
          Store.put(data.meta.guid, {
            uptime_pz_overview: data
          })
        }
        break
      case actions.SET_UPTIME_PZ_OVERVIEW_COUNTS:

        // todo this isn't really good practice, but
        // lets refine this approach later
        var kpiguid = $('x-app-value-card.pz-kpi-card')[0].guid
        var state = Store.get(kpiguid) || {}
        var uptime_pz_overview_counts = state.uptime_pz_overview_counts || {}
        uptime_pz_overview_counts[data.node.replace(endPoints.host, '')] = data
        Store.put(kpiguid, {
          currentPZ: currentPZ,
          currentResolution: currentResolution,
          uptime_pz_overview_counts: uptime_pz_overview_counts
        })

        Store.put(data.meta.guid, {
          uptime_pz_overview_counts: data
        })

        break
      case actions.SET_UPTIME_READERS_OVERVIEW:

        /*  var kpiguid = $('x-app-value-card.eps-kpi-card')[0].guid;
         Store.put(kpiguid, {
         uptime_readers_overview: data
         }); */

        Store.put(data.meta.guid, {
          uptime_readers_overview: data
        })
        break
      case actions.SET_UPTIME_READERS_OVERVIEW_COUNTS:

        var kpiguid = currentPZ ? $('x-app-value-card.reader-kpi-card')[1].guid : $('x-app-value-card.reader-kpi-card')[0].guid
        var state = Store.get(kpiguid) || {}
        var uptime_reader_overview_counts = state.uptime_reader_overview_counts || {}
        uptime_reader_overview_counts[data.node.replace('ws://sensornet1.swim.services:80/', '')] = data

        Store.put(kpiguid, {
          currentPZ: currentPZ,
          currentResolution: currentResolution,
          uptime_reader_overview_counts: uptime_reader_overview_counts
        })

        Store.put(data.meta.guid, {
          uptime_reader_overview_counts: data
        })

        break

      /** SINGLE PZ VIEW -=====================-=====================-===================== */
      case actions.SET_SINGLE_PZ_UPTIME_PERCENTAGE:
        setState('single_pz_uptime_percentage', data, 'pz')
        break

      case actions.SET_SINGLE_PZ_UPTIME_PERCENTAGE_COUNTS:
        setState('single_pz_uptime_percentage_counts', data, 'pz')
        break

      case actions.SET_SINGLE_PZ_TAG_READS:
        setState('single_pz_tag_reads', data, 'pz')
        break
      case actions.SET_SINGLE_PZ_DOWN:
        var kpiguid = $('.right-kpi.pz .downtime')[0].guid
        var state = Store.get(kpiguid) || {}
        var single_pz_down = state.single_pz_down || {}
        single_pz_down[data.node.replace(endPoints.host, '')] = data

        Store.put(kpiguid, {
          currentPZ: currentPZ,
          currentResolution: currentResolution,
          single_pz_down: single_pz_down
        })

        setState('single_pz_down', data, 'pz')
        break

      /** SINGLE Reader VIEW -=====================-=====================-===================== */
      case actions.SET_SINGLE_READER_UPTIME_PERCENTAGE:
        setState('single_reader_uptime_percentage', data, 'reader')
        break
      case actions.SET_SINGLE_READER_DOWNTIME_STATS:

        setState('single_reader_downtime_stats', data, 'reader')
        break
      case actions.SET_SINGLE_READER_TAG_READS:
        setState('single_reader_tag_reads', data, 'reader')
        break

      /** DATA for STEP CHART -=====================-=====================-===================== */

      case actions.GET_ALL_PZ_DATA:
        data.each(function (idx, element) {
          var lane = $(element).attr('data-lane')
          var node = $(element).attr('data-node')
          var guid = $(element)[0].guid
          if (lane === 'readerConnectionHistory') {
            Store.connect({
              host: endPoints.host,
              node: node,
              lane: lane,
              event: actions.SET_READER_CONNECTION_HISTORY,
              meta: {
                guid: guid
              }
            })
          } else if (lane === 'pzConnectionHistory') {
            Store.connect({
              host: endPoints.host,
              node: node,
              lane: lane,
              event: actions.SET_PZ_CONNECTION_HISTORY,
              meta: {
                guid: guid
              }
            })
          }
        })
        break

      case actions.SET_READER_CONNECTION_HISTORY:
        break
      case actions.SET_PZ_CONNECTION_HISTORY:
        break
      case actions.GET_READER_CONNECTIONS_STATES:
        break
      case actions.GET_LOC_DATA:
        break
      case actions.DRAW_LOC_DATA:
        break
      case actions.GET_SANKEY_DATA:
        break
      case actions.GET_KPI_CARD_DATA:
        break
      case actions.DRAW_KPI_DATA:

        break
    }
  }
}
// setup dispatcher
Dispatcher.subscribe(store.dispatched)
module.exports = store


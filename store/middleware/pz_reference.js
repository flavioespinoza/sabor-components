/**
 * Created by Flavor on 6/4/17.
 */
/**
 * Created by Flavor on 6/4/17.
 */
var endPoints = window.app.config.endPoints

var actions = {
  pzUptimePercentage: {
    'SET_UP_TIME': 'SET_UPTIME_PZ_OVERVIEW',
    'SET_UP_TIME_COUNTS': 'SET_UPTIME_PZ_OVERVIEW_COUNTS'
  },
  readerUptimePercentage: {
    'SET_UP_TIME': 'SET_UPTIME_READERS_OVERVIEW',
    'SET_UP_TIME_COUNTS': 'SET_UPTIME_READERS_OVERVIEW_COUNTS',
    'SET_SINGLE_PZ_UPTIME_PERCENTAGE': 'SET_SINGLE_PZ_UPTIME_PERCENTAGE',
    'SET_SINGLE_PZ_UPTIME_PERCENTAGE_COUNTS': 'SET_SINGLE_PZ_UPTIME_PERCENTAGE_COUNTS'
  },
  tagReadCounts: {
    'SET_SINGLE_PZ_TAG_READS': 'SET_SINGLE_PZ_TAG_READS'
  },
  readerDown: {
    'SET_SINGLE_PZ_DOWN': 'SET_SINGLE_PZ_DOWN'
  },
  uptimePercentage: {
    'SET_SINGLE_READER_UPTIME_PERCENTAGE': 'SET_SINGLE_READER_UPTIME_PERCENTAGE'
  },
  readCountStats: {
    'SET_SINGLE_READER_TAG_READS': 'SET_SINGLE_READER_TAG_READS'
  },
  downtimeStats: {
    'SET_SINGLE_READER_DOWNTIME_STATS': 'SET_SINGLE_READER_DOWNTIME_STATS'
  }

}
var titles = {
  pzUptimePercentage: {
    uptimeTitle: 'PZs Uptime Overview',
    uptimeCountTitle: 'PZ Connection Counts'
  },
  readerUptimePercentage: {
    uptimeTitle: 'All Readers Uptime Overview',
    uptimeCountTitle: 'Reader Connection Counts'
  },
  tagReadCounts: {
    uptimeTitle: 'Reader Performance',
    uptimeCountTitle: 'Reader Tag Counts'
  },
  readerDown: {
    title: function (pz_id) {
      return pz_id + ' Reader\'s Downtime Stats'
    }
  },
  uptimePercentage: {
    title: function (reader_id) {
      return 'Reader ' + reader_id + ' Performance'
    }
  },
  readCountStats: {
    title: function (reader_id) {
      return 'Reader ' + reader_id + ' Tag Counts'
    }
  },
  downtimeStats: {
    title: function (reader_id) {
      return 'Reader ' + reader_id + ' Downtime Stats'
    }
  }
}
module.exports = function (action, data) {
  if (data.reader_id) {
    data.charts.each(function (index, element) {
      var node = $(element).attr('data-node') == 'org/NewOrg' ? window.app.config.org : $(element).attr('data-node')
      var lane = $(element).attr('data-lane')
      var infoLane = $(element).attr('data-info-lane')
      var subChartLane = $(element).attr('data-subchart-lane')
      var guid = element.guid

      if (lane === 'uptimePercentage') {
        Store.connect({
          host: endPoints.host,
          node: 'reader/' + data.reader_id,
          lane: lane,
          event: actions[lane].SET_SINGLE_READER_UPTIME_PERCENTAGE,
          meta: {
            guid: guid,
            title: titles[lane].title(data.reader_id),
            reader_id: data.reader_id
          }
        })

        if (subChartLane) {
          Store.connect({
            host: endPoints.host,
            node: 'reader/' + data.reader_id,
            lane: subChartLane,
            event: actions[subChartLane].SET_SINGLE_READER_DOWNTIME_STATS,
            synced: actions[subChartLane].SET_SINGLE_READER_DOWNTIME_STATS,
            meta: {
              guid: guid,
              title: titles[subChartLane].title(data.reader_id),
              reader_id: data.reader_id
            }
          })
        }
      } else {
        Store.connect({
          host: endPoints.host,
          node: 'reader/' + data.reader_id,
          lane: lane,
          event: actions[lane].SET_SINGLE_READER_TAG_READS,
          synced: actions[lane].SET_SINGLE_READER_TAG_READS,
          meta: {
            guid: guid,
            title: titles[subChartLane].title(data.reader_id),
            reader_id: data.reader_id
          }
        })
      }
    })
  } else if (!data.pz_id) {
    // grab the overview charts
    data.charts.each(function (index, element) {
      var node = $(element).attr('data-node')
      var lane = $(element).attr('data-lane')
      var infoLane = $(element).attr('data-info-lane')
      var guid = element.guid
      Store.connect({
        host: endPoints.host,
        node: node,
        lane: lane,
        event: actions[lane].SET_UP_TIME,
        meta: {
          guid: guid,
          title: titles[lane].uptimeTitle
        }
      })
      Store.connect({
        host: endPoints.host,
        node: node,
        lane: infoLane,
        event: actions[lane].SET_UP_TIME_COUNTS,
        meta: {
          guid: guid,
          title: titles[lane].uptimeCountTitle
        }
      })
    })
  } else {
    var pz = data.pz_id.replace(/\//g, ' ').toUpperCase()
    // get information for a specific PZ or a reader
    data.charts.each(function (index, element) {
      var lane = $(element).attr('data-lane')
      var infoLane = $(element).attr('data-info-lane')
      var subChartLane = $(element).attr('data-subchart-lane')
      var guid = element.guid
      if (lane === 'readerUptimePercentage') {
        Store.connect({
          host: endPoints.host,
          node: data.pz_id,
          lane: lane,
          event: actions.readerUptimePercentage.SET_SINGLE_PZ_UPTIME_PERCENTAGE,
          synced: actions.readerUptimePercentage.SET_SINGLE_PZ_UPTIME_PERCENTAGE,
          meta: {
            guid: guid,
            title: pz + ' Uptime Overview'
          }
        })
        Store.connect({
          host: endPoints.host,
          node: data.pz_id,
          lane: infoLane,
          event: actions.readerDown.SET_SINGLE_PZ_DOWN,
          synced: actions.readerDown.SET_SINGLE_PZ_DOWN,
          meta: {
            guid: guid,
            title: pz + ' Counts'
          }
        })

        if (subChartLane) {
          Store.connect({
            host: endPoints.host,
            node: data.pz_id,
            lane: subChartLane,
            event: actions.readerDown.SET_SINGLE_PZ_DOWN,
            synced: actions.readerDown.SET_SINGLE_PZ_DOWN,
            meta: {
              guid: guid,
              title: titles[subChartLane].title(data.pz_id)
            }
          })
        }
      } else {
        Store.connect({
          host: endPoints.host,
          node: data.pz_id,
          lane: lane,
          event: actions.tagReadCounts.SET_SINGLE_PZ_TAG_READS,
          synced: actions.tagReadCounts.SET_SINGLE_PZ_TAG_READS,
          meta: {
            guid: guid,
            title: pz + ' Tag Reads',
            pz_id: data.pz_id
          }
        })
      }
    })
  }
}

